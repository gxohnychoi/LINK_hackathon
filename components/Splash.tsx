'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link2 } from 'lucide-react';

/** 앱 첫 화면 스플래시: 0.6초 페이드인 → 2초 후 /home */
export default function Splash({ serifClass }: { serifClass: string }) {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.replace('/home'), 2000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-splash">
      <div className="flex animate-fade-in flex-col items-center">
        <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-splash-badge">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full border border-gold/30">
            <Link2 size={48} className="text-gold" strokeWidth={1.75} />
          </div>
        </div>
        <p className={`${serifClass} mt-8 flex items-center gap-3 pl-[0.2em] text-5xl tracking-[0.2em] text-white`}>
          LINK <Link2 size={28} className="text-gold" strokeWidth={1.75} />
        </p>
        <p className={`${serifClass} mt-4 text-[10px] tracking-[0.3em] text-gold`}>TOGETHER, WE MAKE A CASE</p>
      </div>
    </div>
  );
}
