export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { order_id } = await req.json();
    if (!order_id) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const apiUrl = isProduction 
      ? `https://api.midtrans.com/v2/${order_id}/status` 
      : `https://api.sandbox.midtrans.com/v2/${order_id}/status`;

    // Midtrans API requires Basic Auth with ServerKey:
    const encodedServerKey = Buffer.from(serverKey + ':').toString('base64');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedServerKey}`
      }
    });

    const data = await response.json();
    if (!response.ok || (data.status_code !== '200' && data.status_code !== '201')) {
      return NextResponse.json({ error: 'Transaction not found or error fetching status from Midtrans' }, { status: 404 });
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    // Use Admin Client to bypass RLS
    const supabase = createAdminClient();

    // Check if payment already exists
    const { data: payment } = await supabase
      .from('payments')
      .select('user_id, plan_type, status')
      .eq('order_id', order_id)
      .single();

    if (!payment) {
      return NextResponse.json({ message: 'Irrelevant order ID' }, { status: 200 });
    }
    
    // If it was already marked as settlement, do nothing to prevent duplicate notifications
    if (payment.status === 'settlement' || payment.status === 'capture') {
        return NextResponse.json({ message: 'Already processed', status: payment.status }, { status: 200 });
    }

    const userId = payment.user_id;
    const plan = payment.plan_type;

    // Update payment status
    await supabase.from('payments').update({ status: transactionStatus }).eq('order_id', order_id);

    // If success, update subscription & insert notification
    if ((transactionStatus === 'capture' && fraudStatus === 'accept') || transactionStatus === 'settlement') {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + 30);

      const { data: existingSub } = await supabase.from('subscriptions').select('id').eq('user_id', userId).single();
        
      if (existingSub) {
        await supabase.from('subscriptions').update({
          plan_type: plan.toLowerCase(),
          status: 'active',
          berlaku_sampai: expiredDate.toISOString()
        }).eq('user_id', userId);
      } else {
        await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_type: plan.toLowerCase(),
          status: 'active',
          berlaku_sampai: expiredDate.toISOString()
        });
      }

      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Pembayaran Berhasil! 🎉',
        message: `Akun Anda telah di-upgrade ke Paket ${plan.toUpperCase()}. Berlaku mulai hari ini sampai ${expiredDate.toLocaleDateString('id-ID')}.`,
        is_read: false
      });
    }

    return NextResponse.json({ message: 'Sync complete', status: transactionStatus }, { status: 200 });

  } catch (error: any) {
    console.error('Manual Sync Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
