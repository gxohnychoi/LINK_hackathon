import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { Link as LinkIcon } from 'lucide-react';
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
      <body className="bg-sand text-ink antialiased">
        <div className="mx-auto min-h-screen w-full max-w-[430px] bg-white">
          <header className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 pb-3 pt-4 backdrop-blur">
            <Link href="/home" className="flex items-center gap-1.5 text-2xl font-black tracking-tight text-ink">
              연결고리 <LinkIcon className="h-6 w-6 text-gold" strokeWidth={2.2} />
            </Link>
            <UserSwitcher current={user} />
          </header>
          <main className="px-5 py-5">{children}</main>
          <footer className="px-5 pb-6 text-center text-xs text-neutral-400">
            <Link href="/debug" className="underline">서버 저장소 보기 (데모)</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
