import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderNav } from '@/components/header-nav';
import { UserMenu } from '@/components/user-menu';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch workspaces for this user
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', user.id)
    .order('dibuat_pada', { ascending: false });

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <HeaderNav user={user} profile={profile} workspaces={workspaces || []} />
      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
