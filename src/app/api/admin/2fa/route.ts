import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin, AuthError, verifyPassword } from '@/lib/auth';
import {
  generateTotpSecret, buildTotpUri, totpQrCodeDataUrl, verifyTotpToken, generateRecoveryCodes,
} from '@/lib/twoFactor';
import { logAudit } from '@/lib/audit';
import { getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

// GET: inicia o setup — gera um segredo temporário e devolve o QR code (não salva ainda).
export async function GET() {
  try {
    const admin = await requireAdmin();
    const secret = generateTotpSecret();
    const uri = buildTotpUri(admin.email, secret, 'Alianca');
    const qr = await totpQrCodeDataUrl(uri);
    return NextResponse.json({ secret, qr });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// POST: confirma a ativação, validando um código gerado a partir do secret exibido no QR.
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(req.headers);
    const { secret, token } = await req.json();

    if (!secret || !token || !verifyTotpToken(token, secret)) {
      return NextResponse.json({ error: 'Código inválido.' }, { status: 400 });
    }

    const { plain, hashed } = await generateRecoveryCodes();

    await prisma.admin.update({
      where: { id: admin.id },
      data: { twoFaEnabled: true, twoFaSecret: secret, recoveryCodesHash: hashed },
    });

    await logAudit({ event: 'TWOFA_ENABLED', adminId: admin.id, ip, result: 'success' });

    // Códigos de recuperação em texto puro só são retornados aqui, uma única vez.
    return NextResponse.json({ ok: true, recoveryCodes: plain });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// DELETE: desativa 2FA — exige a senha atual como confirmação.
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(req.headers);
    const { password } = await req.json();

    const ok = password && (await verifyPassword(admin.passwordHash, password));
    if (!ok) return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });

    await prisma.admin.update({
      where: { id: admin.id },
      data: { twoFaEnabled: false, twoFaSecret: null, recoveryCodesHash: [] },
    });

    await logAudit({ event: 'TWOFA_DISABLED', adminId: admin.id, ip, result: 'success' });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
