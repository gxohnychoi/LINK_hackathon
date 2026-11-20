type Props = { group: { size: number; status: string } | null };

export default function StatusBadge({ group }: Props) {
  const [label, cls] = !group
    ? ['매칭 대기 중', 'bg-slate-100 text-slate-600']
    : group.status === 'rep_confirmed'
      ? ['대표 확정', 'bg-emerald-100 text-emerald-700']
      : [`피해자 ${group.size}명 연결됨`, 'bg-indigo-100 text-indigo-700'];
  return <span className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{label}</span>;
}
