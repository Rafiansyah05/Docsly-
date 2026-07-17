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

  // Execute all independent queries concurrently to dramatically reduce load time
  const [
    { data: workspaces },
    { data: profile },
    { data: subscription },
    { count: unreadCount }
  ] = await Promise.all([
    supabase.from('workspaces').select('*').eq('user_id', user.id).order('dibuat_pada', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false)
  ]);

  if (!profile) {
    // Profil terhapus, sign out user
    await supabase.auth.signOut();
    redirect('/auth/login?error=account_deleted');
  }

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
