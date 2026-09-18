import { z } from 'zod';

// Validação no servidor (item 40) — nunca confiar somente no que o navegador validou.

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200),
  twoFaCode: z.string().length(6).optional(),
});

export const communitySchema = z.object({
  type: z.enum(['GROUP', 'CHANNEL']),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  link: z
    .string()
    .url()
    .max(500)
    .refine((url) => /^https:\/\/(chat\.whatsapp\.com|whatsapp\.com)\//.test(url), {
      message: 'O link deve ser um link oficial do WhatsApp (chat.whatsapp.com ou whatsapp.com).',
    }),
  image: z.string().url().max(500).optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  vip: z.boolean().default(false),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().int().min(0).max(100000).default(0),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  icon: z.string().trim().min(1).max(8).default('🔥'),
});

export const settingsSchema = z.object({
  allianceName: z.string().trim().min(1).max(80),
  logo: z.string().url().max(500).optional().nullable(),
  favicon: z.string().url().max(500).optional().nullable(),
  banner: z.string().url().max(500).optional().nullable(),
  description: z.string().trim().max(500),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().url().max(500).optional().nullable(),
  particlesOn: z.boolean(),
  musicUrl: z.string().url().max(500).optional().nullable(),
  musicEnabled: z.boolean(),
  musicVolume: z.number().min(0).max(1),
  seoTitle: z.string().max(120).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoImage: z.string().url().max(500).optional().nullable(),
});

export const identifyLinkSchema = z.object({
  url: z.string().url().max(500),
});

export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}
