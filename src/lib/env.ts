import { z } from 'zod';

// IMPORTANTE: a validação é "lazy" (só roda quando getEnv() é chamada), e não no
// topo do módulo. Isso evita que o build (etapa "Collecting page data" da Vercel/Next)
// quebre caso as variáveis de ambiente ainda não estejam disponíveis nesse momento —
// a validação real só acontece quando uma rota é de fato executada em runtime.

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET deve ter pelo menos 32 caracteres'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  cached = envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    REDIS_URL: process.env.REDIS_URL,
  });
  return cached;
}
