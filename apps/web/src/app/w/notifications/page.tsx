export const runtime = 'edge';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import React from 'react';
import { DeleteNotificationButton } from '@/components/delete-notification-button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notifikasi | Docsly',
};

function getIcon(title: string) {
  if (title.toLowerCase().includes('berhasil')) {
    return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  }
  if (title.toLowerCase().includes('peringatan') || title.toLowerCase().includes('kedaluwarsa')) {
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
  return <Info className="w-5 h-5 text-blue-500" />;
}

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Mark all as read when visited
  if (notifications && notifications.length > 0) {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Pusat Notifikasi
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 mt-2">
          Pantau pemberitahuan tentang status akun, langganan, dan info penting lainnya.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {(!notifications || notifications.length === 0) ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-200">Belum ada notifikasi</h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-1">Saat ada pemberitahuan baru, akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {notifications.map((notif: any) => (
              <div key={notif.id} className={`p-6 flex gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                <div className="shrink-0 mt-1">
                  {getIcon(notif.title)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                      {notif.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-zinc-500 whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed mt-1">
                    {notif.message}
                  </p>
                </div>
                <div className="shrink-0 flex items-start pt-1">
                  <DeleteNotificationButton id={notif.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
