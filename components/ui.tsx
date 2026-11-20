import { Lock } from 'lucide-react';

/** 공통 스타일 (design/ PNG 톤) */
export const ui = {
  primaryBtn: 'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-center font-bold text-gold disabled:opacity-40',
  secondaryBtn: 'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-sand px-5 text-center font-bold text-ink',
  darkCard: 'rounded-3xl bg-ink p-6 text-white',
  bigNumber: 'text-4xl font-bold tracking-tight text-gold',
  card: 'rounded-2xl bg-sand',
  input: 'w-full min-w-0 rounded-2xl bg-sand px-5 py-4 text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold',
  tag: 'inline-block rounded-lg bg-chip px-3 py-1.5 text-sm font-semibold text-chip-ink',
  sectionTitle: 'text-lg font-bold',
  label: 'block text-sm font-bold text-muted',
};

/** 화면 하단 고정 메인 버튼 영역 */
export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] space-y-2 bg-white px-5 pb-5 pt-3">
      {children}
    </div>
  );
}

/** 자물쇠 아이콘 + 안내 문구 */
export function LockNote({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <Lock className="mt-0.5 h-5 w-5 shrink-0 text-chip-ink" />
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}
