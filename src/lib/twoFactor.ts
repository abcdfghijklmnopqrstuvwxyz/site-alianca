import { authenticator } from 'otplib';
import crypto from 'node:crypto';
import { argon2id, argon2Verify } from 'hash-wasm';
import QRCode from 'qrcode';

/**
 * Gera um novo segredo TOTP compatível com Google/Microsoft Authenticator, Authy etc (item 33).
 * O segredo só deve ser exposto ao dono UMA vez, durante a ativação (via QR code).
 */
export function generateTotpSecret() {
  return authenticator.generateSecret();
}

export function buildTotpUri(email: string, secret: string, allianceName: string) {
  return authenticator.keyuri(email, allianceName || 'Alianca', secret);
}

export async function totpQrCodeDataUrl(uri: string) {
  return QRCode.toDataURL(uri);
}

export function verifyTotpToken(token: string, secret: string) {
  return authenticator.verify({ token, secret });
}

/** Gera 8 códigos de recuperação de uso único, retornando os valores em texto (mostrar 1x só) e seus hashes (persistir). */
export async function generateRecoveryCodes(count = 8) {
  const plain: string[] = [];
  const hashed: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(5).toString('hex');
    plain.push(code);
    const salt = crypto.randomBytes(16);
    hashed.push(
      await argon2id({
        password: code,
        salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 19456,
        hashLength: 32,
        outputType: 'encoded',
      })
    );
  }
  return { plain, hashed };
}

export async function verifyRecoveryCode(code: string, hashes: string[]) {
  for (const hash of hashes) {
    if (await argon2Verify({ password: code, hash }).catch(() => false)) return hash;
  }
  return null;
}
