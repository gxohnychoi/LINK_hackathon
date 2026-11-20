import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import UserSwitcher from '@/components/UserSwitcher';
import { currentUser } from '@/lib/user';

export const metadata: Metadata = {
  title: '연결고리 LINK',
  description: '흩어진 소액 사기 피해를 하나의 사건으로 묶습니다',
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <html lang="ko">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white shadow-sm">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <Link href="/home" className="text-lg font-extrabold tracking-tight text-indigo-600">🔗 연결고리</Link>
            <UserSwitcher current={user} />
          </header>
          <main className="px-4 py-5">{children}</main>
        </div>
      </body>
    </html>
  );
}
