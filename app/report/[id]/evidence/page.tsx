'use client';
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SealBadge from '@/components/SealBadge';
import { sha256Hex } from '@/lib/clue';
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
      // 봉인: 브라우저에서 원본 파일 SHA-256 계산
      const sha256 = await sha256Hex(await file.arrayBuffer());
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
  if (!data) return <p className="text-slate-400">불러오는 중…</p>;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-slate-500">{data.case.itemName}</p>
        <h1 className="text-xl font-bold">증거 올리기</h1>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <div className="flex gap-2">
          {(Object.keys(EVIDENCE_LABEL) as EvidenceKind[]).map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold ${kind === k ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {EVIDENCE_LABEL[k]}
            </button>
          ))}
        </div>
        <label className={`block cursor-pointer rounded-xl border-2 border-dashed border-indigo-300 py-6 text-center font-bold text-indigo-600 ${busy ? 'opacity-50' : ''}`}>
          {busy ? '봉인 중…' : `📷 ${EVIDENCE_LABEL[kind]} 이미지 선택`}
          <input type="file" accept="image/*" className="hidden" disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); }} />
        </label>
        <p className="text-xs text-slate-500">업로드 순간 파일의 지문(SHA-256)과 시각이 기록돼요. 이후 파일이 바뀌면 바로 드러나요.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {data.evidence.map((e) => (
          <div key={e.id} className="overflow-hidden rounded-xl border border-slate-200">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.dataUrl} alt={e.fileName} className="aspect-[6/5] w-full bg-slate-50 object-cover" />
              <div className="absolute bottom-1 left-1"><SealBadge sealedAt={e.sealedAt} /></div>
            </div>
            <div className="p-2">
              <p className="text-sm font-semibold">{EVIDENCE_LABEL[e.kind]}</p>
              <p className="truncate font-mono text-[10px] text-slate-400">{e.sha256.slice(0, 16)}…</p>
            </div>
          </div>
        ))}
      </div>
      {data.evidence.length === 0 && <p className="text-center text-sm text-slate-400">아직 올린 증거가 없어요.</p>}

      <Link href={data.case.groupId ? `/groups/${data.case.groupId}` : '/home'}
        className="block rounded-2xl bg-slate-900 py-3.5 text-center font-bold text-white">
        {data.case.groupId ? '연결된 피해자 보기 →' : '홈으로'}
      </Link>
    </div>
  );
}
