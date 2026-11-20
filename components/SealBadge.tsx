import { kDateTime } from '@/lib/format';

export default function SealBadge({ sealedAt }: { sealedAt: string }) {
  return (
    <span className="inline-block max-w-full rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold leading-tight text-white">
      🔒 봉인됨 · {kDateTime(sealedAt)}
    </span>
  );
}
