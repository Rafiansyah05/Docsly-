export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { snap } from '@/services/payment/midtrans';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (plan !== 'Pro' && plan !== 'Premium') {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const grossAmount = plan === 'Pro' ? 39000 : 89000;
    
    // Generate short order ID: DOC-{PLAN}-{RANDOM}
    const random = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const planPrefix = plan.substring(0, 3).toUpperCase();
    const orderId = `DOC-${planPrefix}-${random}`;

    // Insert to payments table to keep track of the transaction
    const adminSupabase = createAdminClient();
    const { error: insertError } = await adminSupabase.from('payments').insert({
      user_id: user.id,
      order_id: orderId,
      plan_type: plan.toLowerCase(),
      amount: grossAmount,
      status: 'pending'
    });

    if (insertError) {
      console.error('Error inserting payment record:', insertError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Buat parameter transaksi Midtrans
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

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error: any) {
    console.error('Midtrans create error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
