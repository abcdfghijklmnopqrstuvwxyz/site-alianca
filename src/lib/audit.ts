import { prisma } from './db';
import type { AuditEvent } from '@prisma/client';

/**
 * Registra um evento de auditoria (item 47).
 * NUNCA passar em `metadata`: senha, token de sessão, código 2FA, api keys ou cookies.
 */
export async function logAudit(params: {
  event: AuditEvent;
  adminId?: string | null;
  ip?: string | null;
  result: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      event: params.event,
      adminId: params.adminId ?? undefined,
      ip: params.ip ?? undefined,
      result: params.result,
      metadata: params.metadata as any,
    },
  });
}
