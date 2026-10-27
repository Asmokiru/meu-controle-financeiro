-- ============================================================================
-- Meu Controle Financeiro — Script Completo de Tabelas, RLS Granular e Storage Privado
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE "IncomeType" AS ENUM ('FIXED', 'VARIABLE', 'MIXED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "BudgetControlMode" AS ENUM ('INDIVIDUAL', 'FAMILY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CASH_WALLET', 'DIGITAL_ACCOUNT', 'INVESTMENT', 'LOAN_FINANCING'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT', 'DEBT_PAYMENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PIX', 'DEBIT', 'CREDIT', 'BOLETO', 'TRANSFER', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "TransactionStatus" AS ENUM ('PAID', 'PENDING', 'SCHEDULED', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "RecurrenceType" AS ENUM ('ONCE', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'NEGOTIATING', 'PAID_OFF', 'OVERDUE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "DebtStrategy" AS ENUM ('AVALANCHE', 'SNOWBALL'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL UNIQUE,
    "estimated_monthly_income_cents" BIGINT NOT NULL DEFAULT 0,
    "encrypted_income_data" TEXT,
    "income_type" VARCHAR(20) NOT NULL DEFAULT 'FIXED',
    "fixed_monthly_expenses_cents" BIGINT NOT NULL DEFAULT 0,
    "budget_control_mode" VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE REFERENCES public."users"("id") ON DELETE CASCADE,
    "estimatedMonthlyIncomeCents" BIGINT NOT NULL DEFAULT 0,
    "encryptedIncomeData" TEXT,
    "incomeType" "IncomeType" NOT NULL DEFAULT 'FIXED',
    "mainGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fixedMonthlyExpensesCents" BIGINT NOT NULL DEFAULT 0,
    "hasExistingDebts" BOOLEAN NOT NULL DEFAULT false,
    "budgetControlMode" "BudgetControlMode" NOT NULL DEFAULT 'INDIVIDUAL',
    "relevantCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingSkipped" BOOLEAN NOT NULL DEFAULT false,
    "themePreference" VARCHAR(20) NOT NULL DEFAULT 'system',
    "learnedCategoryRulesJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "type" "AccountType" NOT NULL,
    "institutionName" VARCHAR(100),
    "initialBalanceCents" BIGINT NOT NULL DEFAULT 0,
    "currentBalanceCents" BIGINT NOT NULL DEFAULT 0,
    "color" VARCHAR(20) NOT NULL DEFAULT '#0F766E',
    "icon" VARCHAR(40) NOT NULL DEFAULT 'wallet',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(40) NOT NULL DEFAULT 'Mastercard',
    "last_four_digits" VARCHAR(4),
    "total_limit_cents" BIGINT NOT NULL,
    "closing_day" INTEGER NOT NULL CHECK ("closing_day" BETWEEN 1 AND 31),
    "due_day" INTEGER NOT NULL CHECK ("due_day" BETWEEN 1 AND 31),
    "alert_threshold_pct" INTEGER NOT NULL DEFAULT 80,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."credit_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "name" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(40) NOT NULL DEFAULT 'Mastercard',
    "lastFourDigits" VARCHAR(4),
    "totalLimitCents" BIGINT NOT NULL,
    "closingDay" INTEGER NOT NULL CHECK ("closingDay" BETWEEN 1 AND 31),
    "dueDay" INTEGER NOT NULL CHECK ("dueDay" BETWEEN 1 AND 31),
    "alertThresholdPct" INTEGER NOT NULL DEFAULT 80,
    "color" VARCHAR(20) NOT NULL DEFAULT '#1E293B',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
    "icon" VARCHAR(40) NOT NULL DEFAULT 'tag',
    "color" VARCHAR(20) NOT NULL DEFAULT '#0F766E',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isFixedCost" BOOLEAN NOT NULL DEFAULT false,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    UNIQUE ("userId", "slug")
);

CREATE TABLE IF NOT EXISTS public."transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "type" "TransactionType" NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "occurrenceDate" TIMESTAMPTZ NOT NULL,
    "dueDate" TIMESTAMPTZ,
    "originAccountId" UUID REFERENCES public."accounts"("id") ON DELETE SET NULL,
    "destinationAccountId" UUID REFERENCES public."accounts"("id") ON DELETE SET NULL,
    "creditCardId" UUID REFERENCES public."credit_cards"("id") ON DELETE SET NULL,
    "categoryId" UUID NOT NULL REFERENCES public."categories"("id") ON DELETE RESTRICT,
    "description" VARCHAR(200) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PAID',
    "recurrence" "RecurrenceType" NOT NULL DEFAULT 'ONCE',
    "installmentTotal" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "autoClassified" BOOLEAN NOT NULL DEFAULT false,
    "userCorrectedCat" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."budgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "categoryId" UUID NOT NULL REFERENCES public."categories"("id") ON DELETE CASCADE,
    "referenceMonth" VARCHAR(7) NOT NULL,
    "plannedAmountCents" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "accountId" UUID REFERENCES public."accounts"("id") ON DELETE SET NULL,
    "name" VARCHAR(120) NOT NULL,
    "targetAmountCents" BIGINT NOT NULL,
    "currentAmountCents" BIGINT NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMPTZ NOT NULL,
    "recurringContributionCents" BIGINT NOT NULL DEFAULT 0,
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."debts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES public."users"("id") ON DELETE CASCADE,
    "name" VARCHAR(120) NOT NULL,
    "creditor" VARCHAR(120) NOT NULL,
    "totalAmountCents" BIGINT NOT NULL,
    "remainingAmountCents" BIGINT NOT NULL,
    "monthlyInterestRateBp" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "paidInstallments" INTEGER NOT NULL DEFAULT 0,
    "installmentAmountCents" BIGINT NOT NULL,
    "nextDueDate" TIMESTAMPTZ NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferredStrategy" "DebtStrategy" NOT NULL DEFAULT 'AVALANCHE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS public."notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_by_email" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(80) NOT NULL,
    "file_size_bytes" INTEGER NOT NULL CHECK ("file_size_bytes" > 0 AND "file_size_bytes" <= 5242880),
    "sha256_checksum" VARCHAR(64) NOT NULL,
    "storage_object_key" VARCHAR(500) NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public."audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "resource_type" VARCHAR(80) NOT NULL,
    "resource_id" VARCHAR(120),
    "ip_address_masked" VARCHAR(45) NOT NULL,
    "user_agent" VARCHAR(255) NOT NULL,
    "metadata_sanitized" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilita e força RLS em todas as tabelas
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."users" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."profiles" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."user_profiles" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."accounts" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."cards" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."credit_cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."credit_cards" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."categories" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."budgets" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."goals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."goals" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."debts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."debts" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."notifications" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."attachments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."attachments" FORCE ROW LEVEL SECURITY;
ALTER TABLE public."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."audit_logs" FORCE ROW LEVEL SECURITY;

-- Políticas Granulares: SELECT, INSERT, UPDATE, DELETE para authenticated (user_id / "userId" = auth.uid())

-- profiles
DROP POLICY IF EXISTS "Usuários visualizam somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários visualizam somente seu perfil" ON public."profiles" FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários criam somente seu perfil" ON public."profiles" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários alteram somente seu perfil" ON public."profiles" FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seu perfil" ON public."profiles";
CREATE POLICY "Usuários excluem somente seu perfil" ON public."profiles" FOR DELETE TO authenticated USING (user_id = auth.uid());

-- user_profiles
DROP POLICY IF EXISTS "user_isolated_profiles" ON public."user_profiles";
DROP POLICY IF EXISTS "Usuários visualizam somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários visualizam somente seu user_profile" ON public."user_profiles" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários criam somente seu user_profile" ON public."user_profiles" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários alteram somente seu user_profile" ON public."user_profiles" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seu user_profile" ON public."user_profiles";
CREATE POLICY "Usuários excluem somente seu user_profile" ON public."user_profiles" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- accounts
DROP POLICY IF EXISTS "user_isolated_accounts" ON public."accounts";
DROP POLICY IF EXISTS "Usuários visualizam somente suas contas" ON public."accounts";
CREATE POLICY "Usuários visualizam somente suas contas" ON public."accounts" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas contas" ON public."accounts";
CREATE POLICY "Usuários criam somente suas contas" ON public."accounts" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas contas" ON public."accounts";
CREATE POLICY "Usuários alteram somente suas contas" ON public."accounts" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas contas" ON public."accounts";
CREATE POLICY "Usuários excluem somente suas contas" ON public."accounts" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- cards
DROP POLICY IF EXISTS "Usuários visualizam somente seus cartões" ON public."cards";
CREATE POLICY "Usuários visualizam somente seus cartões" ON public."cards" FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seus cartões" ON public."cards";
CREATE POLICY "Usuários criam somente seus cartões" ON public."cards" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seus cartões" ON public."cards";
CREATE POLICY "Usuários alteram somente seus cartões" ON public."cards" FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seus cartões" ON public."cards";
CREATE POLICY "Usuários excluem somente seus cartões" ON public."cards" FOR DELETE TO authenticated USING (user_id = auth.uid());

-- credit_cards
DROP POLICY IF EXISTS "user_isolated_credit_cards" ON public."credit_cards";
DROP POLICY IF EXISTS "Usuários visualizam somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários visualizam somente seus credit_cards" ON public."credit_cards" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários criam somente seus credit_cards" ON public."credit_cards" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários alteram somente seus credit_cards" ON public."credit_cards" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seus credit_cards" ON public."credit_cards";
CREATE POLICY "Usuários excluem somente seus credit_cards" ON public."credit_cards" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- transactions
DROP POLICY IF EXISTS "user_isolated_transactions" ON public."transactions";
DROP POLICY IF EXISTS "Usuários visualizam somente suas transações" ON public."transactions";
CREATE POLICY "Usuários visualizam somente suas transações" ON public."transactions" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas transações" ON public."transactions";
CREATE POLICY "Usuários criam somente suas transações" ON public."transactions" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas transações" ON public."transactions";
CREATE POLICY "Usuários alteram somente suas transações" ON public."transactions" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas transações" ON public."transactions";
CREATE POLICY "Usuários excluem somente suas transações" ON public."transactions" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- categories
DROP POLICY IF EXISTS "user_isolated_categories" ON public."categories";
DROP POLICY IF EXISTS "Usuários visualizam somente suas categorias" ON public."categories";
CREATE POLICY "Usuários visualizam somente suas categorias" ON public."categories" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas categorias" ON public."categories";
CREATE POLICY "Usuários criam somente suas categorias" ON public."categories" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas categorias" ON public."categories";
CREATE POLICY "Usuários alteram somente suas categorias" ON public."categories" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas categorias" ON public."categories";
CREATE POLICY "Usuários excluem somente suas categorias" ON public."categories" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- budgets
DROP POLICY IF EXISTS "user_isolated_budgets" ON public."budgets";
DROP POLICY IF EXISTS "Usuários visualizam somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários visualizam somente seus orçamentos" ON public."budgets" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários criam somente seus orçamentos" ON public."budgets" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários alteram somente seus orçamentos" ON public."budgets" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seus orçamentos" ON public."budgets";
CREATE POLICY "Usuários excluem somente seus orçamentos" ON public."budgets" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- goals
DROP POLICY IF EXISTS "user_isolated_goals" ON public."goals";
DROP POLICY IF EXISTS "Usuários visualizam somente suas metas" ON public."goals";
CREATE POLICY "Usuários visualizam somente suas metas" ON public."goals" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas metas" ON public."goals";
CREATE POLICY "Usuários criam somente suas metas" ON public."goals" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas metas" ON public."goals";
CREATE POLICY "Usuários alteram somente suas metas" ON public."goals" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas metas" ON public."goals";
CREATE POLICY "Usuários excluem somente suas metas" ON public."goals" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- debts
DROP POLICY IF EXISTS "user_isolated_debts" ON public."debts";
DROP POLICY IF EXISTS "Usuários visualizam somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários visualizam somente suas dívidas" ON public."debts" FOR SELECT TO authenticated USING ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários criam somente suas dívidas" ON public."debts" FOR INSERT TO authenticated WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários alteram somente suas dívidas" ON public."debts" FOR UPDATE TO authenticated USING ("userId" = auth.uid()) WITH CHECK ("userId" = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas dívidas" ON public."debts";
CREATE POLICY "Usuários excluem somente suas dívidas" ON public."debts" FOR DELETE TO authenticated USING ("userId" = auth.uid());

-- notifications
DROP POLICY IF EXISTS "Usuários visualizam somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários visualizam somente suas notificações" ON public."notifications" FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários criam somente suas notificações" ON public."notifications" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários alteram somente suas notificações" ON public."notifications" FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente suas notificações" ON public."notifications";
CREATE POLICY "Usuários excluem somente suas notificações" ON public."notifications" FOR DELETE TO authenticated USING (user_id = auth.uid());

-- attachments
DROP POLICY IF EXISTS "Usuários visualizam somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários visualizam somente seus anexos" ON public."attachments" FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários criam somente seus anexos" ON public."attachments" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários alteram somente seus anexos" ON public."attachments" FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seus anexos" ON public."attachments";
CREATE POLICY "Usuários excluem somente seus anexos" ON public."attachments" FOR DELETE TO authenticated USING (user_id = auth.uid());

-- audit_logs
DROP POLICY IF EXISTS "Usuários visualizam somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários visualizam somente seus logs de auditoria" ON public."audit_logs" FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários criam somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários criam somente seus logs de auditoria" ON public."audit_logs" FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários alteram somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários alteram somente seus logs de auditoria" ON public."audit_logs" FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Usuários excluem somente seus logs de auditoria" ON public."audit_logs";
CREATE POLICY "Usuários excluem somente seus logs de auditoria" ON public."audit_logs" FOR DELETE TO authenticated USING (user_id = auth.uid());
