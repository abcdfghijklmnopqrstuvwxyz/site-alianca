import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`click:${ip}`, RATE_LIMITS.click.limit, RATE_LIMITS.click.windowMs);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Muitas requisições, tente novamente em instantes.' }, { status: 429 });
  }

  const type = params.type === 'grupo' ? 'GROUP' : params.type === 'canal' ? 'CHANNEL' : null;
  if (!type) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });

  const community = await prisma.community.findFirst({
    where: { slug: params.id, type, active: true },
    select: { id: true, link: true },
  });

  if (!community) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  // Apenas incrementa um contador simples — sem rastrear usuários individualmente (item 16).
  await prisma.community.update({ where: { id: community.id }, data: { clicks: { increment: 1 } } });

  return NextResponse.redirect(community.link, { status: 302 });
}
