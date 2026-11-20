'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { BottomBar, LockNote, ui } from '@/components/ui';

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
    <form onSubmit={submit}>
      <PageHeader title="대표에게 증거 위임하기" />
      <div className={`${ui.card} mt-6 p-5`}>
        <LockNote>
          봉인된 내 증거가 대표 피해자에게 전달돼요. 대표가 피해자 전원의 증거를 묶어 경찰서에 제출합니다.
          <br /><b>⚠️ 대표가 내 이름과 증거를 보게 됩니다.</b> 다른 피해자에게는 보이지 않아요.
        </LockNote>
      </div>
      <label className={`${ui.label} mt-8`}>이름
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동"
          className={`${ui.input} mt-2 font-normal`} />
      </label>
      <label className={`${ui.card} mt-4 flex items-start gap-3 p-4`}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-ink" />
        <span className="font-semibold">대표에게 내 증거를 전달하는 데 동의합니다</span>
      </label>
      <BottomBar>
        <button disabled={!agree || !name.trim() || busy} className={ui.primaryBtn}>위임하기</button>
      </BottomBar>
    </form>
  );
}
