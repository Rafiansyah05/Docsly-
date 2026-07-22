import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BillingClient } from './billing-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Akun - Docsly',
  description: 'Kelola status langganan dan tagihan akun Docsly Anda.',
};

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/auth/login');
  }

  // Fetch the latest active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_type, status, berlaku_sampai')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('berlaku_sampai', { ascending: false })
    .limit(1)
    .single();

  // Fetch billing history (payments)
  const { data: payments } = await supabase
    .from('payments')
    .select('id, order_id, amount, plan_type, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <BillingClient 
      subscription={subscription || null} 
      payments={payments || []} 
    />
  );
}
