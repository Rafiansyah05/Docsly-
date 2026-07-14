import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import { WorkspaceShell } from '@/components/workspace-shell';

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: workspaces } = await supabase.from('workspaces').select('*').eq('user_id', user.id).order('dibuat_pada', { ascending: false });

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <WorkspaceShell 
      user={user} 
      profile={profile} 
      workspaces={workspaces || []} 
      subscription={subscription || null}
      unreadNotificationCount={unreadCount || 0}
    >
      {children}
    </WorkspaceShell>
  );
}
