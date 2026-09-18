import { NextResponse } from 'next/server';
import { destroySession, getSessionAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST() {
  const admin = await getSessionAdmin();
  await destroySession();
  if (admin) {
    await logAudit({ event: 'LOGOUT', adminId: admin.id, result: 'success' });
  }
  return NextResponse.json({ ok: true });
}
