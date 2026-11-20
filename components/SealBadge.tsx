import { kDateTime } from '@/lib/format';

export default function SealBadge({ sealedAt }: { sealedAt: string }) {
  return (
    <span className="inline-block rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">
      🔒 봉인됨 · {kDateTime(sealedAt)}
    </span>
  );
}
