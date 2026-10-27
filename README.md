# Meu Controle Financeiro 🇧🇷

Plataforma web completa de gestão financeira pessoal em português do Brasil, projetada sob os princípios de **Security by Design**, **Row Level Security (RLS)**, **Privacy by Design (LGPD)** e **Acessibilidade Universal (WCAG 2.2 AA)**.

> **Aviso Importante sobre Dados de Demonstração:** Todos os registros pré-carregados no seed e na demonstração (`Mariana Costa [CONTA DEMO - DADOS FICTÍCIOS]`, `demo@exemplo.ficticio.local`) são **100% fictícios** e claramente identificados com a tag `[EXEMPLO / DEMO]`. Nenhum dado pessoal, bancário ou credencial real é incluído no código.

---

## 🔐 Configuração Segura de Variáveis de Ambiente e Chaves do Supabase

### Regra de Ouro de Segurança
- **NUNCA** envie, exiba, armazene ou importe `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ou chaves iniciadas por `sb_secret_` no frontend, navegador, componentes `"use client"` ou variáveis com prefixo `NEXT_PUBLIC_`.
- Nenhum usuário final pode configurar URL ou chaves do Supabase pela interface.

### 1. Variáveis Públicas (Seguras para o Frontend — Respeitam RLS)
Utilize **somente** estas variáveis públicas no cliente (`src/lib/supabase/client.ts`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 2. Variáveis Exclusivas do Servidor / Backend (Sem `NEXT_PUBLIC_`)
Utilize estas variáveis **exclusivamente** no servidor (`src/lib/supabase/admin.ts`), protegido por `import 'server-only'`:

```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

Caso haja compatibilidade temporária com chaves legadas, utilize **apenas no backend**:
```env
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Procedimento Obrigatório de Rotação de Chave no Supabase Dashboard
Se qualquer chave administrativa (`service_role` ou `sb_secret_`) tiver sido visualizada em tela ou ambiente local:
1. Acesse o **Supabase Dashboard** do seu projeto e navegue até **Settings → API Keys**.
2. Crie uma **nova Secret Key** (`sb_secret_...`).
3. Atualize o valor de `SUPABASE_SECRET_KEY` **exclusivamente** no cofre de segredos / variáveis de ambiente privadas do servidor (nunca em `NEXT_PUBLIC_`).
4. Confirme que nenhum serviço ou rotina interna depende da chave antiga.
5. **Revogue, desative ou exclua imediatamente a chave antiga** no painel **Settings → API Keys**.
6. Verifique que `.env`, `.env.local` e `.env.production` estão listados no `.gitignore` e nunca foram enviados ao controle de versão.

---

## 🛡️ Arquitetura de Clientes Supabase e Row Level Security (RLS)

- **Cliente Público (`src/lib/supabase/client.ts` / `lib/supabase/client.ts`)**: Utiliza apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Opera sempre sob as políticas de **Row Level Security (RLS)** do usuário autenticado (`auth.uid()`).
- **Cliente Administrativo (`src/lib/supabase/admin.ts` / `lib/supabase/admin.ts`)**: Protegido com `import 'server-only'`, bloqueio em tempo de execução contra execução no navegador (`typeof window !== 'undefined'`), `autoRefreshToken: false` e `persistSession: false`.
- **Políticas RLS Granulares (`prisma/migrations/20261026000100_enable_granular_rls/migration.sql`)**:
  - `ROW LEVEL SECURITY` habilitada e forçada em todas as tabelas com dados de usuários: `profiles` (`user_profiles`), `accounts`, `cards` (`credit_cards`), `transactions`, `categories`, `budgets`, `goals`, `debts`, `notifications`, `attachments`, `audit_logs` e `users`.
  - Políticas separadas para `SELECT`, `INSERT`, `UPDATE` e `DELETE` restritas a `TO authenticated` garantindo `user_id = auth.uid()`.
  - Bucket `mcf-private-attachments` configurado como **privado** (`public = false`) com políticas equivalentes em `storage.objects`.

---

## 🚀 Como Executar e Validar o Projeto

### 1. Configurar Variáveis de Ambiente Locais
Copie o modelo `.env.example` para `.env` e preencha apenas no ambiente local seguro:
```powershell
Copy-Item .env.example .env
```

### 2. Executar a Verificação de Regressão de Segurança e Suíte de Testes
```powershell
npm test
```
Ou individualmente:
```powershell
npm run security:check
node --experimental-strip-types --test tests/platform.test.ts
```

### 3. Iniciar o Servidor de Desenvolvimento
```powershell
npm run dev
```
Acesse **`http://localhost:3000`** no navegador.
