import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { argon2id, argon2Verify } from 'hash-wasm';
import crypto from 'node:crypto';
import { prisma } from './db';
import { getEnv } from './env';

const SESSION_COOKIE = 'alianca_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas — expiração de sessão (item 32)

// Lazy: só lê/valida AUTH_SECRET quando alguma função abaixo é realmente chamada em
// runtime, nunca no carregamento do módulo (evita quebrar o build da Vercel).
function getSecretKey() {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

// --- Senha ---------------------------------------------------------------

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  return argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 19456, // ~19 MB, recomendação OWASP para argon2id
    hashLength: 32,
    outputType: 'encoded',
  });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    return false;
  }
}

// --- Sessão ----------------------------------------------------------------
// Estratégia: JWT curto assinado (prova de posse rápida) + registro em DB (Session)
// para permitir revogação real no logout / troca de senha, evitando sessão "zumbi".

async function signSessionToken(sessionId: string) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function createSession(adminId: string, meta?: { ip?: string; userAgent?: string }) {
  const session = await prisma.session.create({
    data: {
      adminId,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
      ip: meta?.ip,
      userAgent: meta?.userAgent,
    },
  });

  const token = await signSessionToken(session.id);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getEnv().NODE_ENV === 'production', // Secure em produção (item 32)
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return session;
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  cookies().delete(SESSION_COOKIE);
  if (!token) return;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const sid = payload.sid as string | undefined;
    if (sid) {
      // Revoga de fato no banco — não basta apagar o cookie (item 32: logout invalida sessão).
      await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    }
  } catch {
    // token inválido, nada a revogar
  }
}

/**
 * Retorna o admin autenticado a partir da sessão válida, ou null.
 * Usar em toda rota/Server Component que precisa saber quem está logado.
 * NUNCA confiar em nada vindo do cliente para decidir autorização (item 36).
 */
export async function getSessionAdmin() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let sid: string | undefined;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    sid = payload.sid as string | undefined;
  } catch {
    return null; // assinatura inválida ou expirada
  }
  if (!sid) return null;

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session.admin;
}

/**
 * Helper para usar no início de toda API administrativa / Server Action sensível.
 * Lança erro controlado se não houver sessão válida — a rota deve responder 401.
 */
export async function requireAdmin() {
  const admin = await getSessionAdmin();
  if (!admin) {
    throw new AuthError('Não autenticado');
  }
  return admin;
}

export class AuthError extends Error {}
