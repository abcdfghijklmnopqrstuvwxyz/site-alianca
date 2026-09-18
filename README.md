# NOME_DA_ALIANCA — Central de Grupos e Canais

Site institucional (Next.js 14 / App Router / TypeScript / Tailwind / Prisma) para divulgar grupos e canais de WhatsApp de uma "Aliança", com painel administrativo protegido.

Identidade visual: preto + vermelho sangue, estética dark/underground/ocultista, conforme o prompt original.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL via Prisma (funciona com Supabase Postgres também)
- Autenticação própria: sessão em cookie HttpOnly + tabela `Session` no banco (revogável), senha com Argon2id, 2FA via TOTP (otplib)
- Zod para validação de todos os inputs no servidor

## Como rodar localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure o .env
cp .env.example .env
# edite DATABASE_URL, AUTH_SECRET (gere com: openssl rand -base64 48),
# ADMIN_EMAIL e ADMIN_PASSWORD (usados só no seed)

# 3. Suba o schema no banco
npx prisma migrate dev --name init

# 4. Rode o seed (cria o admin inicial, categorias padrão e settings)
npm run seed

# 5. Rode em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` para o site público e `http://localhost:3000/admin/login` para o painel, usando o `ADMIN_EMAIL`/`ADMIN_PASSWORD` definidos no `.env` (usados apenas para gerar o hash no seed — a senha em texto puro não fica salva em lugar nenhum).

## Estrutura principal

```
src/
  app/
    page.tsx              Home
    grupos/                /grupos
    canais/                /canais
    grupo/[slug]/           página individual do grupo
    canal/[slug]/           página individual do canal
    sobre/
    admin/
      login/                login (público)
      (protected)/          tudo que exige sessão: dashboard, grupos, canais,
                             categorias, configuracoes, seguranca, logs
    api/
      auth/login|logout
      admin/grupos|canais|categorias|configuracoes|identificar|2fa
      click/[type]/[id]      contador de clique + redirect
  components/               Navbar, Footer, CommunityCard, CommunityManager, etc.
  lib/                      db, auth, validators, rateLimit, ssrf, twoFactor, audit
  middleware.ts             primeira barreira de proteção de /admin/*
prisma/
  schema.prisma
  seed.ts
```

## O que já está implementado

- CRUD completo de grupos e canais (criar, editar VIP/destaque/ativo, excluir)
- Categorias
- Configurações gerais (nome, cores, música, SEO) via painel
- Identificação automática de link do WhatsApp (Open Graph) com proteção contra SSRF (allowlist de domínio + checagem de IP resolvido)
- Login com rate limiting por IP e por conta, mensagens de erro genéricas, timing-safe
- 2FA (TOTP) opcional com QR code e códigos de recuperação de uso único
- Sessão em cookie HttpOnly/Secure/SameSite, revogável no banco, com expiração
- Log de auditoria (login, logout, CRUD, mudança de VIP, configurações, tentativas bloqueadas) — nunca grava senha/token/2FA
- Headers de segurança (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Validação de todos os inputs com Zod no servidor
- Contador de cliques simples (sem rastreio individual de usuário)
- SEO básico (metadata dinâmica, sitemap.xml, robots.txt)

## O que precisa de atenção antes de ir para produção

Este é um esqueleto funcional e já com boas práticas de segurança aplicadas, mas alguns pontos merecem reforço específico para o seu ambiente de produção:

1. **Rate limiting distribuído**: `src/lib/rateLimit.ts` usa memória local, o que funciona em um único processo/dev. Em produção com mais de uma instância, troque por Redis/Upstash (a assinatura da função já foi pensada para isso).
2. **Upload de arquivos** (logo, banner, música): os campos de configuração hoje aceitam apenas URLs. Se for implementar upload direto, siga o item de segurança de upload do prompt original (validar MIME real, bloquear extensões executáveis, gerar nomes aleatórios, limitar tamanho) — ainda não incluído neste esqueleto.
3. **CSRF**: as rotas de API usam `SameSite=Lax` no cookie de sessão, o que já mitiga a maior parte dos ataques CSRF em navegadores modernos. Para reforçar em operações críticas (excluir, alterar 2FA), considere adicionar um token CSRF explícito por formulário.
4. **Backups do banco**: configure backups automáticos no seu provedor Postgres/Supabase — não é algo que o código da aplicação resolve sozinho.
5. **HTTPS em produção**: garanta que o proxy/host force HTTPS; o cookie de sessão só fica `Secure` quando `NODE_ENV=production`.
6. **NEXT_PUBLIC_SITE_URL**: defina essa variável em produção para o sitemap e robots.txt gerarem URLs corretas.

## Segurança — regra geral

Toda API administrativa chama `requireAdmin()` no início, que valida a sessão no servidor — nunca confia em nada vindo do cliente. Isso está no `middleware.ts` (primeira barreira) e de novo em cada rota (segunda barreira), seguindo o princípio de "nunca confiar no cliente" do prompt original.
