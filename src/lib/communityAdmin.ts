import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './db';
import { requireAdmin, AuthError } from './auth';
import { communitySchema, slugify } from './validators';
import { checkRateLimit, getClientIp, RATE_LIMITS } from './rateLimit';
import { logAudit } from './audit';
import type { CommunityType } from '@prisma/client';

async function guard(req: NextRequest) {
  const admin = await requireAdmin();
  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`admin-write:${admin.id}`, RATE_LIMITS.adminWrite.limit, RATE_LIMITS.adminWrite.windowMs);
  if (!rl.allowed) throw new RateLimitedError();
  return { admin, ip };
}

class RateLimitedError extends Error {}

export async function listCommunities(type: CommunityType) {
  return prisma.community.findMany({
    where: { type },
    include: { category: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });
}

export async function handleCreate(req: NextRequest, type: CommunityType) {
  try {
    const { admin, ip } = await guard(req);
    const body = await req.json().catch(() => null);
    const parsed = communitySchema.safeParse({ ...body, type });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const baseSlug = slugify(parsed.data.name) || 'comunidade';
    let slug = baseSlug;
    let attempt = 1;
    while (await prisma.community.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`;
    }

    const community = await prisma.community.create({ data: { ...parsed.data, slug } });

    await logAudit({
      event: 'COMMUNITY_CREATED',
      adminId: admin.id,
      ip,
      result: 'success',
      metadata: { id: community.id, type },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleUpdate(req: NextRequest, id: string, type: CommunityType) {
  try {
    const { admin, ip } = await guard(req);
    const body = await req.json().catch(() => null);
    const parsed = communitySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await prisma.community.findFirst({ where: { id, type } });
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    const trackVipChange = parsed.data.vip !== undefined && parsed.data.vip !== existing.vip;

    const updated = await prisma.community.update({ where: { id }, data: parsed.data });

    await logAudit({
      event: trackVipChange ? 'VIP_CHANGED' : 'COMMUNITY_UPDATED',
      adminId: admin.id,
      ip,
      result: 'success',
      metadata: { id, type },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleDelete(req: NextRequest, id: string, type: CommunityType) {
  try {
    const { admin, ip } = await guard(req);
    const existing = await prisma.community.findFirst({ where: { id, type } });
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

    await prisma.community.delete({ where: { id } });

    await logAudit({
      event: 'COMMUNITY_DELETED',
      adminId: admin.id,
      ip,
      result: 'success',
      metadata: { id, type },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown) {
  if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  if (e instanceof RateLimitedError) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 });
  console.error(e);
  // Nunca vazar stack trace/detalhes internos para o cliente (item 51).
  return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
}
