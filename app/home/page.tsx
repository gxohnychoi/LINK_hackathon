'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen, Lock } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { won, kDate } from '@/lib/format';

type MyCase = {
  id: string; platform: string; itemName: string; amount: number; sentAt: string; evidenceCount: number;
  group: { id: string; size: number; status: string; isRep: boolean } | null;
};

const darkBtn = 'block w-full rounded-2xl bg-ink py-4 text-center text-lg font-bold text-gold';

export default function Home() {
  const [data, setData] = useState<{ user: string; cases: MyCase[] } | null>(null);
  useEffect(() => { fetch('/api/cases/mine').then((r) => r.json()).then(setData); }, []);
  if (!data) return <p className="text-neutral-400">불러오는 중…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-neutral-500">데모 유저 {data.user}님의</p>
        <h1 className="text-[28px] font-black tracking-tight">내 사건</h1>
      </div>
      {data.cases.length === 0 && <p className="rounded-3xl bg-sand p-6 text-center text-neutral-500">등록된 피해가 없어요.</p>}
      {data.cases.map((c) => (
        <div key={c.id} className="space-y-3">
          <div className="rounded-[28px] bg-ink p-6 text-white">
            <StatusBadge group={c.group} />
            <p className="mt-5 text-xl font-bold">{c.itemName}</p>
            <p className="mt-1 text-sm text-neutral-400">{c.platform} · {kDate(c.sentAt)}</p>
            <p className="mt-6 text-4xl font-black tracking-tight text-gold">
              {won(c.amount)} <span className="text-base font-semibold">피해</span>
            </p>
          </div>
          {c.group ? (
            <Link href={`/groups/${c.group.id}`} className={darkBtn}>연결된 피해자 보기 →</Link>
          ) : (
            <div className="flex items-start gap-3 rounded-3xl bg-sand p-5">
              <Lock className="mt-0.5 h-6 w-6 shrink-0 text-gold-deep" />
              <p className="text-neutral-500">같은 사기범의 다른 피해자가 등록되면 자동으로 연결돼요.</p>
            </div>
          )}
          <Link href={`/report/${c.id}/evidence`} className="flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-neutral-500">
            <FolderOpen className="h-4 w-4" /> 내 증거 관리 ({c.evidenceCount}건)
          </Link>
        </div>
      ))}
      <Link href="/report/new" className={darkBtn}>+ 피해 등록하기</Link>
    </div>
  );
}
