export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Ambil langganan aktif
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ message: 'No active subscription' });
    }

    const expiryDate = new Date(subscription.berlaku_sampai);
    const now = new Date();
    
    // Hitung selisih hari
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      // 1. Kedaluwarsa: Downgrade akun
      await adminSupabase.from('subscriptions').update({ status: 'expired' }).eq('id', subscription.id);
      
      // 2. Beri Notifikasi
      await adminSupabase.from('notifications').insert({
        user_id: user.id,
        title: 'Langganan Kedaluwarsa ⚠️',
        message: `Masa aktif paket ${subscription.plan_type.toUpperCase()} Anda telah habis. Akun Anda telah kembali menjadi Free Plan. Silakan perbarui langganan untuk menikmati fitur premium lagi.`,
        is_read: false
      });

      return NextResponse.json({ message: 'Subscription expired and downgraded' });
    } 
    
    if (diffDays <= 3) {
      // Cek apakah sudah ada notifikasi peringatan dalam 3 hari terakhir agar tidak spam
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: existingWarning } = await adminSupabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .like('title', 'Peringatan Masa Aktif%')
        .gte('created_at', threeDaysAgo.toISOString())
        .limit(1);

      if (!existingWarning || existingWarning.length === 0) {
        // Kirim peringatan
        await adminSupabase.from('notifications').insert({
          user_id: user.id,
          title: 'Peringatan Masa Aktif ⏳',
          message: `Masa aktif paket ${subscription.plan_type.toUpperCase()} Anda akan habis dalam ${diffDays} hari. Lakukan pembayaran untuk terus menikmati fitur premium.`,
          is_read: false
        });
        return NextResponse.json({ message: 'Warning notification sent' });
      }
    }

    return NextResponse.json({ message: 'Subscription is active' });
  } catch (error: any) {
    console.error('Sync subscription error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
