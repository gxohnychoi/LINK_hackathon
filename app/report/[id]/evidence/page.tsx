'use client';
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Camera } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SealBadge from '@/components/SealBadge';
import { BottomBar, ui } from '@/components/ui';
import { sealEvidence } from '@/lib/crypto';
import { EVIDENCE_LABEL, type Evidence, type EvidenceKind } from '@/lib/types';

const readDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result as string);
  r.onerror = rej;
  r.readAsDataURL(f);
});

export default function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{ case: { itemName: string; groupId: string | null }; evidence: Evidence[] } | null>(null);
  const [err, setErr] = useState('');
  const [kind, setKind] = useState<EvidenceKind>('transfer');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/cases/${id}/evidence`).then(async (r) => {
      const j = await r.json();
      if (!r.ok) setErr(j.error); else setData(j);
    });
  }, [id]);
  useEffect(load, [load]);

  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) return alert('5MB 이하 이미지만 올릴 수 있어요');
    setBusy(true);
    try {
      // 봉인: 브라우저에서 원본 파일 해시 계산 (봉인 시각은 서버 기록 기준)
      const { sha256 } = await sealEvidence(file);
      const dataUrl = await readDataUrl(file);
      const r = await fetch(`/api/cases/${id}/evidence`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, fileName: file.name, dataUrl, sha256 }),
      });
      if (!r.ok) alert((await r.json()).error);
      load();
    } finally {
      setBusy(false);
    }
  }

  if (err) return <p className="text-red-600">{err}</p>;
  if (!data) return <p className="text-muted">불러오는 중…</p>;

  return (
    <div>
      <PageHeader title="증거 올리기" />
      <p className="mt-4 text-sm text-muted">{data.case.itemName}</p>

      <div className={`${ui.card} mt-4 space-y-3 p-4`}>
        <div className="flex gap-2">
          {(Object.keys(EVIDENCE_LABEL) as EvidenceKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${kind === k ? 'bg-ink text-gold' : 'bg-white text-ink'}`}>
              {EVIDENCE_LABEL[k]}
            </button>
          ))}
        </div>
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-6 text-center font-bold text-chip-ink ${busy ? 'opacity-50' : ''}`}>
          {busy ? '봉인 중…' : <><Camera className="h-5 w-5" /> {EVIDENCE_LABEL[kind]} 이미지 선택</>}
          <input type="file" accept="image/*" className="hidden" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
        </label>
        <p className="text-xs text-muted">업로드 순간 파일의 지문(SHA-256)과 시각이 기록돼요. 이후 파일이 바뀌면 바로 드러나요.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {data.evidence.map((e) => (
          <div key={e.id} className={`${ui.card} overflow-hidden`}>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.dataUrl} alt={e.fileName} className="aspect-[6/5] w-full bg-white object-cover" />
              <div className="absolute bottom-1 left-1 right-1"><SealBadge sealedAt={e.sealedAt} /></div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold">{EVIDENCE_LABEL[e.kind]}</p>
              <p className="truncate font-mono text-[10px] text-muted">{e.sha256.slice(0, 16)}…</p>
            </div>
          </div>
        ))}
      </div>
      {data.evidence.length === 0 && <p className="mt-8 text-center text-sm text-muted">아직 올린 증거가 없어요.</p>}

      <BottomBar>
        <Link href={data.case.groupId ? `/groups/${data.case.groupId}` : '/home'} className={ui.primaryBtn}>
          {data.case.groupId ? '연결된 피해자 보기 →' : '홈으로'}
        </Link>
      </BottomBar>
    </div>
  );
}
