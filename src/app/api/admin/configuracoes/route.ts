import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { settingsSchema } from '@/lib/validators';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    throw e;
  }
  const settings = await prisma.settings.findUnique({ where: { id: 'main' } });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`admin-write:${admin.id}`, RATE_LIMITS.adminWrite.limit, RATE_LIMITS.adminWrite.windowMs);
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });

    const body = await req.json().catch(() => null);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const settings = await prisma.settings.upsert({
      where: { id: 'main' },
      update: parsed.data,
      create: { id: 'main', ...parsed.data },
    });

    await logAudit({ event: 'SETTINGS_UPDATED', adminId: admin.id, ip, result: 'success' });

    return NextResponse.json(settings);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
