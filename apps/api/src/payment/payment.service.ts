import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentService {
  private snap: any;
  private coreApi: any;

  constructor() {
    const config = {
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    };
    this.snap = new midtransClient.Snap(config);
    this.coreApi = new midtransClient.CoreApi(config);
  }

  private getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createTransaction(user: any, plan: string, paymentMethod: string = 'bca_va') {
    if (plan !== 'Pro' && plan !== 'Premium') {
      throw new Error('Invalid plan selected');
    }

    const grossAmount = plan === 'Pro' ? 39000 : 89000;
    
    // Generate short order ID: DOC-{PLAN}-{RANDOM}
    const random = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const planPrefix = plan.substring(0, 3).toUpperCase();
    const orderId = `DOC-${planPrefix}-${random}`;

    const adminSupabase = this.getSupabaseAdmin();
    const { error: insertError } = await adminSupabase.from('payments').insert({
      user_id: user.id,
      order_id: orderId,
      plan_type: plan.toLowerCase(),
      amount: grossAmount,
      status: 'pending'
    });

    if (insertError) {
      console.error('Error inserting payment record:', insertError);
      throw new Error('Failed to create payment record');
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount
      },
      customer_details: {
        email: user.email,
        first_name: user.user_metadata?.full_name || 'Docsly User'
      },
      item_details: [
        {
          id: `DOCSLY-${plan.toUpperCase()}`,
          price: grossAmount,
          quantity: 1,
          name: `Docsly ${plan} Plan (1 Month)`
        }
      ]
    };

    if (paymentMethod === 'bca_va') {
      parameter.payment_type = 'bank_transfer';
      parameter.bank_transfer = { bank: 'bca' };
    } else if (paymentMethod === 'mandiri_va') {
      parameter.payment_type = 'echannel';
      parameter.echannel = { bill_info1: 'Payment For:', bill_info2: 'Docsly Subscription' };
    } else if (paymentMethod === 'bni_va') {
      parameter.payment_type = 'bank_transfer';
      parameter.bank_transfer = { bank: 'bni' };
    } else if (paymentMethod === 'qris') {
      parameter.payment_type = 'qris';
    } else if (paymentMethod === 'gopay') {
      parameter.payment_type = 'gopay';
    } else {
      parameter.payment_type = 'bank_transfer';
      parameter.bank_transfer = { bank: 'bca' };
    }

    try {
      const transaction = await this.coreApi.charge(parameter);
      
      return {
        order_id: orderId,
        payment_type: paymentMethod,
        transaction_status: transaction.transaction_status,
        va_numbers: transaction.va_numbers,
        bill_key: transaction.bill_key,
        biller_code: transaction.biller_code,
        actions: transaction.actions, // Digunakan untuk QRIS / GoPay QR code link
      };
    } catch (err: any) {
      console.error("CoreAPI charge failed:", err?.message || err);
      throw new Error('Failed to process payment with Midtrans');
    }
  }

  async syncStatus(userId: string, orderId: string) {
    // Basic stub for sync status
    const adminSupabase = this.getSupabaseAdmin();
    
    const orderInfo = await this.coreApi.transaction.status(orderId).catch(() => null);
    
    let paymentStatus = 'pending';
    if (orderInfo) {
      const transactionStatus = orderInfo.transaction_status;
      const fraudStatus = orderInfo.fraud_status;
      
      if (transactionStatus === 'capture') {
        paymentStatus = fraudStatus === 'challenge' ? 'challenge' : 'success';
      } else if (transactionStatus === 'settlement') {
        paymentStatus = 'success';
      } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        paymentStatus = 'failed';
      }

      if (paymentStatus === 'success') {
        const { data: paymentRecord } = await adminSupabase
          .from('payments')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (paymentRecord && paymentRecord.status !== 'success') {
          await adminSupabase
            .from('payments')
            .update({ status: 'success' })
            .eq('order_id', orderId);

          const targetUserId = userId || paymentRecord.user_id;
          const planType = paymentRecord.plan_type === 'pro' ? 'Pro Plan' : 'Premium Plan';
          
          if (targetUserId) {
            await adminSupabase.from('profiles').update({ subscription_plan: planType }).eq('id', targetUserId);
            
            // Set expiry date to 1 month from now
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            // Expire any existing active subscriptions first
            await adminSupabase
              .from('subscriptions')
              .update({ status: 'expired' })
              .eq('user_id', targetUserId)
              .eq('status', 'active');
              
            // Insert the new active subscription
            await adminSupabase.from('subscriptions').insert({
              user_id: targetUserId,
              plan_type: paymentRecord.plan_type,
              status: 'active',
              berlaku_sampai: expiryDate.toISOString()
            });

            // Reset user limits so they can use the new plan immediately
            await adminSupabase
              .from('user_limits')
              .update({
                ai_credits_used: 0,
                ai_limit_reset_at: null,
                citations_used: 0,
                citations_limit_reset_at: null
              })
              .eq('user_id', targetUserId);
          }
        }
      }
    }
    return { success: true, status: paymentStatus };
  }
}
