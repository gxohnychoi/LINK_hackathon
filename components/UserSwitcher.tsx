'use client';
import { USERS, type UserId } from '@/lib/types';

export default function UserSwitcher({ current }: { current: UserId }) {
  return (
    <select
      className="rounded-xl bg-sand px-3 py-1.5 text-sm font-semibold text-ink focus:outline-none"
      value={current}
      onChange={(e) => {
        document.cookie = `demoUser=${e.target.value}; path=/; max-age=86400`;
        window.location.href = '/home';
      }}
    >
      {USERS.map((u) => <option key={u} value={u}>데모 유저 {u}</option>)}
    </select>
  );
}
