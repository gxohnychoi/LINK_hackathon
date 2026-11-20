import { Lock } from 'lucide-react';
import { kDateTime } from '@/lib/format';

export default function SealBadge({ sealedAt }: { sealedAt: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-lg bg-ink/85 px-2 py-0.5 text-[10px] font-semibold leading-tight text-gold">
      <Lock className="h-3 w-3 shrink-0" strokeWidth={2.5} /> 봉인됨 · {kDateTime(sealedAt)}
    </span>
  );
}
