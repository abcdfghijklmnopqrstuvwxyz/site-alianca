import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Checagem rápida no edge: só confirma que existe um cookie de sessão com assinatura
// válida (não expirado). A verificação completa (sessão existe no banco, admin ativo)
// acontece de novo em getSessionAdmin()/requireAdmin() dentro de cada rota/página —
// o middleware é só a primeira barreira, nunca a única (item 36).

const SESSION_COOKIE = 'alianca_session';
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secretKey);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
