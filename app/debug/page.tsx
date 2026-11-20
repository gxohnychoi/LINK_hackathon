'use client';
import { useEffect, useMemo, useState } from 'react';

export default function DebugPage() {
  const [data, setData] = useState<unknown>(null);
  const [q, setQ] = useState('');
  useEffect(() => { fetch('/api/debug/db').then((r) => r.json()).then(setData); }, []);
  const text = useMemo(() => (data ? JSON.stringify(data, null, 2) : ''), [data]);
  const hits = useMemo(() => {
    if (!q.trim()) return [];
    return text.split('\n').filter((l) => l.includes(q.trim()));
  }, [q, text]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">서버 저장소 뷰어</h1>
      <p className="text-sm text-slate-500">서버 메모리에 저장된 모든 데이터입니다. 사기범 단서는 해시값으로만 존재해요.</p>
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="예: 110123456789"
        className="w-full rounded-xl border border-slate-300 px-3 py-2"
      />
      {q.trim() && (
        <div className={`rounded-xl p-3 text-sm font-semibold ${hits.length ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>
          검색 결과 {hits.length}건
          {hits.slice(0, 20).map((h, i) => <div key={i} className="mt-1 break-all font-mono text-xs font-normal">{h.trim()}</div>)}
        </div>
      )}
      <pre className="max-h-[60vh] overflow-auto rounded-xl bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">{text || '불러오는 중…'}</pre>
    </div>
  );
}
