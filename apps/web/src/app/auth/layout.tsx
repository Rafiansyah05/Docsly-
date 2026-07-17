export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import AuthLayoutClient from './AuthLayoutClient';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
