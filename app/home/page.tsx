'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { won, kDate } from '@/lib/format';

type MyCase = {
  id: string; platform: string; itemName: string; amount: number; sentAt: string; evidenceCount: number;
  group: { id: string; size: number; status: string; isRep: boolean } | null;
};

export default function Home() {
  const [data, setData] = useState<{ user: string; cases: MyCase[] } | null>(null);
  useEffect(() => { fetch('/api/cases/mine').then((r) => r.json()).then(setData); }, []);
  if (!data) return <p className="text-slate-400">불러오는 중…</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">데모 유저 {data.user}님의</p>
        <h1 className="text-2xl font-extrabold">내 사건</h1>
      </div>
      {data.cases.length === 0 && <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">등록된 피해가 없어요.</p>}
      {data.cases.map((c) => (
        <div key={c.id} className="space-y-3 rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500">{c.platform} · {kDate(c.sentAt)}</p>
              <p className="text-lg font-bold">{c.itemName}</p>
              <p className="text-slate-600">{won(c.amount)} 피해</p>
            </div>
            <StatusBadge group={c.group} />
          </div>
          {c.group ? (
            <Link href={`/groups/${c.group.id}`} className="block rounded-xl bg-indigo-600 py-2.5 text-center font-bold text-white">
              연결된 피해자 보기 →
            </Link>
          ) : (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">같은 사기범의 다른 피해자가 등록되면 자동으로 연결돼요.</p>
          )}
          <Link href={`/report/${c.id}/evidence`} className="block text-center text-sm font-semibold text-slate-600 underline">
            내 증거 관리 ({c.evidenceCount}건)
          </Link>
        </div>
      ))}
      <Link href="/report/new" className="block rounded-2xl border-2 border-dashed border-indigo-300 py-4 text-center font-bold text-indigo-600">
        + 피해 등록하기
      </Link>
    </div>
  );
}
