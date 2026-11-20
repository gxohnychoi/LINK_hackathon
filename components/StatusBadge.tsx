type Props = { group: { size: number; status: string } | null };

// 어두운 사건 카드 위에 올라가는 상태 배지
export default function StatusBadge({ group }: Props) {
  const [label, cls] = !group
    ? ['매칭 대기 중', 'bg-badge text-gold']
    : group.status === 'rep_confirmed'
      ? ['대표 확정', 'bg-gold text-ink']
      : [`피해자 ${group.size}명 연결됨`, 'bg-badge text-gold'];
  return <span className={`inline-block shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold ${cls}`}>{label}</span>;
}
