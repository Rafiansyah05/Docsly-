import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { DashboardWorkspaces } from '@/components/dashboard-workspaces';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*, documents(count)')
    .eq('user_id', user.id)
    .order('dibuat_pada', { ascending: false });

  return (
    <div className="min-h-full">
      <DashboardWorkspaces initialWorkspaces={workspaces || []} userId={user.id} />
    </div>
  );
}
