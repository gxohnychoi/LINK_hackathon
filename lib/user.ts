import { cookies } from 'next/headers';
import { USERS, type UserId } from './types';

export async function currentUser(): Promise<UserId> {
  const v = (await cookies()).get('demoUser')?.value as UserId | undefined;
  return v && USERS.includes(v) ? v : 'A';
}
