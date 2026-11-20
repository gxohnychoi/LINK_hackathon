'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { BottomBar, LockNote, ui } from '@/components/ui';
import { won, kDate } from '@/lib/format';

type MyCase = {
  id: string; platform: string; itemName: string; amount: number; sentAt: string; evidenceCount: number;
  group: { id: string; size: number; status: string; isRep: boolean } | null;
};

export default function Home() {
  const [data, setData] = useState<{ user: string; cases: MyCase[] } | null>(null);
  useEffect(() => { fetch('/api/cases/mine').then((r) => r.json()).then(setData); }, []);
  if (!data) return <p className="text-muted">불러오는 중…</p>;

  return (
    <div className="pt-4">
      <p className="text-sm text-muted">데모 유저 {data.user}님의</p>
      <h1 className="text-[28px] font-bold tracking-tight">내 사건</h1>

      {data.cases.length === 0 && <p className={`${ui.card} mt-8 p-6 text-center text-muted`}>등록된 피해가 없어요.</p>}
      {data.cases.map((c) => (
        <div key={c.id} className="mt-8 space-y-3">
          <div className={ui.darkCard}>
            <StatusBadge group={c.group} />
            <p className="mt-5 text-xl font-bold">{c.itemName}</p>
            <p className="mt-1 text-sm text-white/70">{c.platform} · {kDate(c.sentAt)}</p>
            <p className={`mt-6 ${ui.bigNumber}`}>
              {won(c.amount)} <span className="text-sm font-semibold text-white">피해</span>
            </p>
          </div>
          {c.group ? (
            <Link href={`/groups/${c.group.id}`} className={ui.primaryBtn}>연결된 피해자 보기 →</Link>
          ) : (
            <div className={`${ui.card} p-5`}>
              <LockNote>같은 사기범의 다른 피해자가 등록되면 자동으로 연결돼요.</LockNote>
            </div>
          )}
          <Link href={`/report/${c.id}/evidence`} className="flex items-center justify-center gap-1.5 py-1 text-sm font-semibold text-muted">
            <FolderOpen className="h-4 w-4" /> 내 증거 관리 ({c.evidenceCount}건)
          </Link>
        </div>
      ))}

      <BottomBar>
        <Link href="/report/new" className={ui.primaryBtn}>+ 피해 등록하기</Link>
      </BottomBar>
    </div>
  );
}
