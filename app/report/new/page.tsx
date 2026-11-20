'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hmacClue } from '@/lib/clue';
import { CLUE_LABEL, type ClueType } from '@/lib/types';

const PLACEHOLDER: Record<ClueType, string> = {
  account: '110-123-456789', phone: '010-1234-5678', nick: '아이패드팝니다', kakao: 'seller123', url: 'https://example.com/pay',
};
const input = 'w-full min-w-0 rounded-xl border border-slate-300 px-3 py-2.5 text-base focus:border-indigo-500 focus:outline-none';

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
        (Object.keys(clues) as ClueType[]).map(async (type) => ({ type, hmac: await hmacClue(type, clues[type]) })),
      )).filter((c): c is { type: ClueType; hmac: string } => !!c.hmac);
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

  return (
    <form onSubmit={submit} className="space-y-6">
      <h1 className="text-xl font-bold">피해 등록하기</h1>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-700">① 피해 정보</h2>
        <select className={input} value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}>
          {['중고나라', '당근', '번개장터', '기타'].map((p) => <option key={p}>{p}</option>)}
        </select>
        <input className={input} placeholder="물품명 (예: 아이패드 에어 5)" value={f.itemName} onChange={(e) => setF({ ...f, itemName: e.target.value })} />
        <input className={input} inputMode="numeric" placeholder="피해 금액 (원)" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
        <label className="block text-sm text-slate-500">송금 날짜
          <input type="date" className={input} value={f.sentAt} onChange={(e) => setF({ ...f, sentAt: e.target.value })} />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-700">② 사기범 단서 <span className="text-sm font-normal text-slate-400">(아는 것만)</span></h2>
        <div className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
          🔒 단서는 암호로 바뀌어 저장돼요. 저희도 원래 값을 볼 수 없어요.
        </div>
        {(Object.keys(CLUE_LABEL) as ClueType[]).map((t) => (
          <label key={t} className="block text-sm text-slate-500">{CLUE_LABEL[t]}
            <div className="flex gap-2">
              {t === 'account' && (
                <select className={`${input} w-28 shrink-0`} value={bank} onChange={(e) => setBank(e.target.value)}>
                  {['은행', '신한', '국민', '우리', '하나', '농협', '카카오', '토스'].map((b) => <option key={b} value={b === '은행' ? '' : b}>{b}</option>)}
                </select>
              )}
              <input className={input} placeholder={PLACEHOLDER[t]} value={clues[t]} onChange={(e) => setClues({ ...clues, [t]: e.target.value })} />
            </div>
          </label>
        ))}
      </section>

      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <button disabled={busy} className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white disabled:opacity-50">
        {busy ? '등록 중…' : '등록하고 같은 피해자 찾기'}
      </button>
    </form>
  );
}
