import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const notification = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';

    // Verify signature key to ensure request comes from Midtrans
    const hash = crypto.createHash('sha512');
    hash.update(notification.order_id + notification.status_code + notification.gross_amount + serverKey);
    const expectedSignatureKey = hash.digest('hex');

    if (expectedSignatureKey !== notification.signature_key) {
      console.warn('Midtrans webhook: Invalid signature key');
      return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const orderId = notification.order_id;

    console.log(`Midtrans webhook received: Order ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

    const supabase = createAdminClient();

    // Fetch payment record to get user_id and plan
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('user_id, plan_type')
      .eq('order_id', orderId)
      .single();

    if (paymentError || !payment) {
      console.warn(`Payment record not found for orderId: ${orderId}`);
      return NextResponse.json({ message: 'Irrelevant order ID or not found' }, { status: 200 });
    }

    const userId = payment.user_id;
    const plan = payment.plan_type; // 'pro' or 'premium'

    // Update payment status
    await supabase.from('payments').update({
      status: transactionStatus
    }).eq('order_id', orderId);

    // Check if the payment is successful
    if (
      (transactionStatus === 'capture' && fraudStatus === 'accept') ||
      transactionStatus === 'settlement'
    ) {
      const supabase = createAdminClient();
      
      const startDate = new Date();
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() + 30); // 30 days subscription duration

      console.log(`Updating subscription for user ${userId} to ${plan}...`);

      // Check if user already has a subscription row
      const { data: existingSub, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
         console.error('Error fetching subscription:', fetchError);
      }
        
      if (existingSub) {
        // Update existing subscription
        const { error: updateError } = await supabase.from('subscriptions').update({
          plan_type: plan.toLowerCase(),
          status: 'active',
          berlaku_sampai: expiredDate.toISOString()
        }).eq('user_id', userId);
        
        if (updateError) console.error('Error updating subscription:', updateError);
      } else {
        // Create new subscription row
        const { error: insertError } = await supabase.from('subscriptions').insert({
          user_id: userId,
          plan_type: plan.toLowerCase(),
          status: 'active',
          berlaku_sampai: expiredDate.toISOString()
        });
        if (insertError) console.error('Error inserting subscription:', insertError);
      }

      // 3. Tambahkan notifikasi ke tabel notifications
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Pembayaran Berhasil! 🎉',
        message: `Akun Anda telah di-upgrade ke Paket ${plan.toUpperCase()}. Berlaku mulai hari ini sampai ${expiredDate.toLocaleDateString('id-ID')}.`,
        is_read: false
      });

      if (notifError) console.error('Error inserting notification:', notifError);
    }

    return NextResponse.json({ message: 'Notification processed' }, { status: 200 });
  } catch (error: any) {
    console.error('Midtrans webhook processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
