'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Lock } from 'lucide-react';
import { makeClueHash } from '@/lib/crypto';
import { CLUE_LABEL, type ClueType } from '@/lib/types';

const PLACEHOLDER: Record<ClueType, string> = {
  account: '110-123-456789', phone: '010-1234-5678', nick: '아이패드팝니다', kakao: 'seller123', url: 'https://example.com/pay',
};
const input = 'w-full min-w-0 rounded-2xl bg-sand px-5 py-4 text-base text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-gold';
const bare = 'w-full min-w-0 bg-transparent text-base text-ink placeholder:text-neutral-400 focus:outline-none';
const label = 'block text-sm font-bold text-neutral-500';

export default function NewReport() {
  const router = useRouter();
  const [f, setF] = useState({ platform: '중고나라', itemName: '', amount: '', sentAt: '' });
  const [bank, setBank] = useState('');
  const [clues, setClues] = useState<Record<ClueType, string>>({ account: '', phone: '', nick: '', kakao: '', url: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      // 브라우저에서 정규화 + HMAC → 해시값만 서버로
      const hashed = (await Promise.all(
        (Object.keys(clues) as ClueType[])
          .filter((type) => clues[type].trim())
          .map(async (type) => ({ type, hmac: await makeClueHash(type, clues[type]) })),
      )).filter((c) => c.hmac);
      const r = await fetch('/api/cases', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...f, amount: Number(f.amount.replace(/\D/g, '')), clues: hashed }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      router.push(`/report/${j.id}/evidence`);
    } catch (e) {
      setErr((e as Error).message); setBusy(false);
    }
  }

  const setClue = (t: ClueType, v: string) => setClues({ ...clues, [t]: v });

  return (
    <form onSubmit={submit} className="space-y-8">
      <h1 className="border-b border-neutral-200 pb-4 text-2xl font-black tracking-tight">피해 등록하기</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-black">① 피해 정보</h2>
        <div className="relative">
          <select className={`${input} appearance-none pr-12`} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
            {['중고나라', '당근', '번개장터', '기타'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
        </div>
        <input className={input} placeholder="물품명 (예: 아이패드 에어 5)" value={f.itemName} onChange={(e) => setF({ ...f, itemName: e.target.value })} />
        <input className={input} inputMode="numeric" placeholder="피해 금액 (원)" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <label className={`${label} space-y-2`}>송금 날짜
          <input type="date" className={`${input} mt-2 font-normal`} value={f.sentAt} onChange={(e) => setF({ ...f, sentAt: e.target.value })} />
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black">② 사기범 단서 <span className="text-sm font-normal text-neutral-400">(아는 것만)</span></h2>

        <label className={label}>{CLUE_LABEL.account}
          <div className="mt-2 flex items-center gap-2 rounded-2xl bg-sand px-5 py-4 font-normal focus-within:ring-2 focus-within:ring-gold">
            <div className="relative shrink-0">
              <select className="appearance-none bg-transparent pr-5 text-base text-ink focus:outline-none" value={bank} onChange={(e) => setBank(e.target.value)}>
                {['은행', '신한', '국민', '우리', '하나', '농협', '카카오', '토스'].map((b) => <option key={b} value={b === '은행' ? '' : b}>{b}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
            <input className={bare} placeholder={PLACEHOLDER.account} value={clues.account} onChange={(e) => setClue('account', e.target.value)} />
          </div>
        </label>

        {(['phone', 'nick'] as ClueType[]).map((t) => (
          <label key={t} className={label}>{CLUE_LABEL[t]}
            <input className={`${input} mt-2 font-normal`} placeholder={PLACEHOLDER[t]} value={clues[t]} onChange={(e) => setClue(t, e.target.value)} />
          </label>
        ))}

        <div className="grid grid-cols-2 gap-3">
          {(['kakao', 'url'] as ClueType[]).map((t) => (
            <label key={t} className="block min-w-0 rounded-2xl bg-sand px-4 py-3 focus-within:ring-2 focus-within:ring-gold">
              <span className="block text-xs text-neutral-500">{CLUE_LABEL[t]}</span>
              <input className={`${bare} mt-1`} placeholder={PLACEHOLDER[t]} value={clues[t]} onChange={(e) => setClue(t, e.target.value)} />
            </label>
          ))}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Lock className="mt-0.5 h-6 w-6 shrink-0 text-gold-deep" />
          <p className="text-sm text-neutral-500">단서는 암호로 바뀌어 저장돼요. 저희도 원래 값을 볼 수 없어요.</p>
        </div>
      </section>

      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <button disabled={busy} className="w-full rounded-2xl bg-ink py-4 text-lg font-bold text-gold disabled:opacity-50">
        {busy ? '등록 중…' : '등록하고 같은 피해자 찾기'}
      </button>
    </form>
  );
}
