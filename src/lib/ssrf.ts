import dns from 'node:dns/promises';
import net from 'node:net';

// Allowlist de hosts que o sistema tem permissão de tentar "identificar" (item 42).
const ALLOWED_HOSTS = ['chat.whatsapp.com', 'whatsapp.com', 'www.whatsapp.com'];

function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 0) return true; // não é IP válido, trate como suspeito

  // IPv4 privados/reservados/loopback/link-local/metadata
  const parts = ip.split('.').map(Number);
  if (parts.length === 4) {
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local / cloud metadata (169.254.169.254)
    if (a === 0) return true;
  }

  // IPv6 loopback/link-local/ULA
  if (ip === '::1') return true;
  if (ip.startsWith('fe80:')) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;

  return false;
}

/**
 * Verifica se é seguro o servidor buscar essa URL (item 42 — SSRF).
 * Só permite domínios do WhatsApp na allowlist, com protocolo https,
 * e resolve o DNS para garantir que não aponta pra rede interna.
 */
export async function assertSafeExternalUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (url.protocol !== 'https:') {
    throw new Error('Apenas URLs https são permitidas.');
  }

  if (!ALLOWED_HOSTS.includes(url.hostname)) {
    throw new Error('Domínio não permitido para identificação automática.');
  }

  const { address } = await dns.lookup(url.hostname);
  if (isPrivateIp(address)) {
    throw new Error('URL resolve para um endereço interno/privado — bloqueado.');
  }

  return url;
}
