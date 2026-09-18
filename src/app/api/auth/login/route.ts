import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { verifyTotpToken, verifyRecoveryCode } from '@/lib/twoFactor';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';
import { loginSchema } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const GENERIC_ERROR = { error: 'Credenciais inválidas.' }; // item 50 — nunca revelar se o email existe

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(GENERIC_ERROR, { status: 400 });
  }
  const { email, password, twoFaCode } = parsed.data;

  // Rate limit por IP E por conta (item 34) — bloqueia tanto ataque distribuído quanto foco numa conta.
  const ipLimit = checkRateLimit(`login:ip:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);
  const accountLimit = checkRateLimit(`login:acc:${email}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs);

  if (!ipLimit.allowed || !accountLimit.allowed) {
    await logAudit({ event: 'BLOCKED_ATTEMPT', ip, result: 'rate_limited', metadata: { email } });
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      { status: 429 }
    );
  }

  const admin = await prisma.admin.findUnique({ where: { email } });

  // Sempre executa um hash mesmo se o admin não existir, para não vazar timing/existência de conta.
  const dummyHash = '$argon2id$v=19$m=19456,t=2,p=1$Y2FzYWNhc2FjYXNhY2FzYQ$0000000000000000000000000000';
  const passwordOk = await verifyPassword(admin?.passwordHash ?? dummyHash, password);

  if (!admin || !passwordOk) {
    await logAudit({ event: 'LOGIN_FAILED', ip, result: 'invalid_credentials', metadata: { email } });
    return NextResponse.json(GENERIC_ERROR, { status: 401 });
  }

  if (admin.twoFaEnabled) {
    if (!twoFaCode) {
      return NextResponse.json({ error: 'Código de autenticação necessário.', requires2fa: true }, { status: 401 });
    }

    const totpOk = admin.twoFaSecret ? verifyTotpToken(twoFaCode, admin.twoFaSecret) : false;
    const recoveryHash = !totpOk ? await verifyRecoveryCode(twoFaCode, admin.recoveryCodesHash) : null;

    if (!totpOk && !recoveryHash) {
      await logAudit({ event: 'LOGIN_FAILED', ip, adminId: admin.id, result: 'invalid_2fa' });
      return NextResponse.json(GENERIC_ERROR, { status: 401 });
    }

    if (recoveryHash) {
      // Código de recuperação é de uso único — remove após o uso.
      await prisma.admin.update({
        where: { id: admin.id },
        data: { recoveryCodesHash: admin.recoveryCodesHash.filter((h) => h !== recoveryHash) },
      });
    }
  }

  await createSession(admin.id, { ip, userAgent: req.headers.get('user-agent') ?? undefined });
  await logAudit({ event: 'LOGIN_SUCCESS', ip, adminId: admin.id, result: 'success' });

  return NextResponse.json({ ok: true });
}
