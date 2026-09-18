import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { categorySchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(req.headers);
    const rl = checkRateLimit(`admin-write:${admin.id}`, RATE_LIMITS.adminWrite.limit, RATE_LIMITS.adminWrite.windowMs);
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });

    const body = await req.json().catch(() => null);
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const category = await prisma.category.create({ data: parsed.data });
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
