'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DelegatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await fetch(`/api/groups/${id}/delegate`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }),
    });
    if (!r.ok) { alert((await r.json()).error); setBusy(false); return; }
    router.push(`/groups/${id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h1 className="text-xl font-bold">대표에게 증거 위임하기</h1>
      <p className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800">
        봉인된 내 증거가 대표 피해자에게 전달돼요. 대표가 피해자 전원의 증거를 묶어 경찰서에 제출합니다.
        <br />이름은 대표에게만 보여요.
      </p>
      <label className="block text-sm text-slate-500">이름
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-base" />
      </label>
      <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5" />
        <span className="font-semibold">대표에게 내 증거를 전달하는 데 동의합니다</span>
      </label>
      <button disabled={!agree || !name.trim() || busy}
        className="w-full rounded-2xl bg-indigo-600 py-3.5 font-bold text-white disabled:opacity-40">
        위임하기
      </button>
    </form>
  );
}
