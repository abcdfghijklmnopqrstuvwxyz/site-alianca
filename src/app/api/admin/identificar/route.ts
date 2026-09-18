import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth';
import { identifyLinkSchema } from '@/lib/validators';
import { assertSafeExternalUrl } from '@/lib/ssrf';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

function extractMeta(html: string, property: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const match = html.match(re);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(); // rota administrativa protegida (item 23/36)
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    throw e;
  }

  const ip = getClientIp(req.headers);
  const rl = checkRateLimit(`identify:${ip}`, RATE_LIMITS.linkIdentify.limit, RATE_LIMITS.linkIdentify.windowMs);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Muitas requisições, aguarde um pouco.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = identifyLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'URL inválida.' }, { status: 400 });
  }

  let safeUrl: URL;
  try {
    safeUrl = await assertSafeExternalUrl(parsed.data.url); // proteção SSRF (item 42)
  } catch (e) {
    return NextResponse.json(
      { error: 'Não foi possível identificar automaticamente as informações deste link. Preencha os dados manualmente.' },
      { status: 200 }
    );
  }

  const type = safeUrl.pathname.includes('/channel/') ? 'CHANNEL' : 'GROUP';

  try {
    const res = await fetch(safeUrl.toString(), {
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AliancaBot/1.0)' },
    });
    const html = await res.text();

    const name = extractMeta(html, 'og:title');
    const image = extractMeta(html, 'og:image');
    const description = extractMeta(html, 'og:description');

    if (!name) {
      return NextResponse.json({
        identified: false,
        message: 'Não foi possível identificar automaticamente as informações deste link. Preencha os dados manualmente.',
        type,
      });
    }

    return NextResponse.json({ identified: true, type, name, image, description, link: parsed.data.url });
  } catch {
    return NextResponse.json({
      identified: false,
      message: 'Não foi possível identificar automaticamente as informações deste link. Preencha os dados manualmente.',
      type,
    });
  }
}
