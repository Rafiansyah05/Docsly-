import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentService {
  private snap: any;

  constructor() {
    this.snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
    });
  }

  private getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async createTransaction(user: any, plan: string) {
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

    const transaction = await this.snap.createTransaction(parameter);

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url
    };
  }

  async syncStatus(userId: string, orderId: string) {
    // Basic stub for sync status
    const adminSupabase = this.getSupabaseAdmin();
    
    const { data: orderInfo } = await this.snap.transaction.status(orderId).catch(() => ({ data: null }));
    
    if (orderInfo) {
      const transactionStatus = orderInfo.transaction_status;
      const fraudStatus = orderInfo.fraud_status;
      
      let paymentStatus = 'pending';
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
            .update({ status: 'success', payment_method: orderInfo.payment_type })
            .eq('order_id', orderId);

          const planType = paymentRecord.plan_type === 'pro' ? 'Pro Plan' : 'Premium Plan';
          await adminSupabase.from('profiles').update({ subscription_plan: planType }).eq('id', userId);
        }
      }
    }
    return { success: true };
  }
}
