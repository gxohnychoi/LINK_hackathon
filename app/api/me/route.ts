import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/user';
export async function GET() { return NextResponse.json({ user: await currentUser() }); }
