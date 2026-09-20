import { PrismaClient } from '@prisma/client';
import { argon2id } from 'hash-wasm';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed.'
    );
  }

  const salt = crypto.randomBytes(16);
  const passwordHash = await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 2,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'encoded',
  });

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash },
  });

  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main' },
  });

  const categorias = [
    { name: 'Geral', icon: '🔥' },
    { name: 'Games', icon: '🎮' },
    { name: 'Música', icon: '🎵' },
    { name: 'Conversas', icon: '💬' },
    { name: 'Dark', icon: '🖤' },
  ];
  for (const c of categorias) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('Seed concluído. Admin:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
