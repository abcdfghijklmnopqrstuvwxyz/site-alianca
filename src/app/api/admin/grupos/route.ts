import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth';
import { listCommunities, handleCreate } from '@/lib/communityAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    throw e;
  }
  const groups = await listCommunities('GROUP');
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  return handleCreate(req, 'GROUP');
}
