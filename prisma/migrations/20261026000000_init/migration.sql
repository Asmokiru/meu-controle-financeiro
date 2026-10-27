-- ============================================================================
-- Migration: 20261026000000_init
-- Meu Controle Financeiro - Schema Inicial Completo (22 Entidades + RLS)
-- ============================================================================

-- CreateEnum
CREATE TYPE "IncomeType" AS ENUM ('FIXED', 'VARIABLE', 'MIXED');
CREATE TYPE "BudgetControlMode" AS ENUM ('INDIVIDUAL', 'FAMILY');
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CASH_WALLET', 'DIGITAL_ACCOUNT', 'INVESTMENT', 'LOAN_FINANCING');
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER', 'INVESTMENT', 'DEBT_PAYMENT');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PIX', 'DEBIT', 'CREDIT', 'BOLETO', 'TRANSFER', 'OTHER');
CREATE TYPE "TransactionStatus" AS ENUM ('PAID', 'PENDING', 'SCHEDULED', 'OVERDUE');
CREATE TYPE "RecurrenceType" AS ENUM ('ONCE', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "DebtStatus" AS ENUM ('ACTIVE', 'NEGOTIATING', 'PAID_OFF', 'OVERDUE');
CREATE TYPE "DebtStrategy" AS ENUM ('AVALANCHE', 'SNOWBALL');
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'BOTH', 'NONE');
CREATE TYPE "NotificationType" AS ENUM (
  'UPCOMING_DUE', 'OVERDUE_BILL', 'BUDGET_THRESHOLD', 'UNUSUAL_EXPENSE',
  'LOW_BALANCE', 'NEW_RECURRING_DETECTED', 'GOAL_REACHED', 'WEEKLY_REMINDER',
  'DUPLICATE_PAYMENT_WARNING', 'HIGH_CARD_USAGE', 'SECURITY_ALERT'
);
CREATE TYPE "ExportFormat" AS ENUM ('JSON', 'CSV', 'XLSX', 'PDF');
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'EXPIRED', 'FAILED');
CREATE TYPE "SecuritySeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- 1. users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" VARCHAR(128),
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetTokenHash" VARCHAR(128),
    "passwordResetExpires" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "deletionRequestedAt" TIMESTAMP(3),
    "deletionScheduledFor" TIMESTAMP(3),
    "isDemoAccount" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- 2. user_profiles
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- 3. sessions
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "accessTokenJti" VARCHAR(64) NOT NULL,
    "refreshTokenHash" VARCHAR(128) NOT NULL,
    "refreshTokenFamily" VARCHAR(64) NOT NULL,
    "browser" VARCHAR(120) NOT NULL,
    "os" VARCHAR(80) NOT NULL,
    "deviceName" VARCHAR(120) NOT NULL,
    "approximateLocation" VARCHAR(120) NOT NULL,
    "ipAddressMasked" VARCHAR(45) NOT NULL,
    "mfaVerified" BOOLEAN NOT NULL DEFAULT false,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedReason" VARCHAR(120),
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "sessions_accessTokenJti_key" ON "sessions"("accessTokenJti");
CREATE UNIQUE INDEX "sessions_refreshTokenHash_key" ON "sessions"("refreshTokenHash");
CREATE INDEX "sessions_userId_isRevoked_idx" ON "sessions"("userId", "isRevoked");

-- 4. mfa_configurations
CREATE TABLE "mfa_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "encryptedTotpSecret" TEXT NOT NULL,
    "backupCodesHashed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verifiedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mfa_configurations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mfa_configurations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "mfa_configurations_userId_key" ON "mfa_configurations"("userId");

-- 5. accounts
CREATE TABLE "accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" "AccountType" NOT NULL,
    "institutionName" VARCHAR(100),
    "initialBalanceCents" BIGINT NOT NULL DEFAULT 0,
    "currentBalanceCents" BIGINT NOT NULL DEFAULT 0,
    "color" VARCHAR(20) NOT NULL DEFAULT '#0F766E',
    "icon" VARCHAR(40) NOT NULL DEFAULT 'wallet',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "accounts_userId_isArchived_idx" ON "accounts"("userId", "isArchived");

-- 6. credit_cards
CREATE TABLE "credit_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(40) NOT NULL DEFAULT 'Mastercard',
    "lastFourDigits" VARCHAR(4),
    "totalLimitCents" BIGINT NOT NULL,
    "closingDay" INTEGER NOT NULL CHECK ("closingDay" BETWEEN 1 AND 31),
    "dueDay" INTEGER NOT NULL CHECK ("dueDay" BETWEEN 1 AND 31),
    "alertThresholdPct" INTEGER NOT NULL DEFAULT 80,
    "color" VARCHAR(20) NOT NULL DEFAULT '#1E293B',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "credit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "credit_cards_userId_isArchived_idx" ON "credit_cards"("userId", "isArchived");

-- 7. categories
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
    "icon" VARCHAR(40) NOT NULL DEFAULT 'tag',
    "color" VARCHAR(20) NOT NULL DEFAULT '#0284C7',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isFixedCost" BOOLEAN NOT NULL DEFAULT false,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "categories_userId_slug_key" ON "categories"("userId", "slug");
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- 8. subcategories
CREATE TABLE "subcategories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subcategories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "subcategories_userId_categoryId_idx" ON "subcategories"("userId", "categoryId");

-- 9. transactions
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "occurrenceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "originAccountId" UUID,
    "destinationAccountId" UUID,
    "creditCardId" UUID,
    "categoryId" UUID NOT NULL,
    "subcategoryId" UUID,
    "description" VARCHAR(200) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PIX',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PAID',
    "recurrence" "RecurrenceType" NOT NULL DEFAULT 'ONCE',
    "recurrenceRule" VARCHAR(120),
    "installmentTotal" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "autoClassified" BOOLEAN NOT NULL DEFAULT false,
    "userCorrectedCat" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_originAccountId_fkey" FOREIGN KEY ("originAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "transactions_userId_occurrenceDate_idx" ON "transactions"("userId", "occurrenceDate");
CREATE INDEX "transactions_userId_categoryId_idx" ON "transactions"("userId", "categoryId");
CREATE INDEX "transactions_userId_status_idx" ON "transactions"("userId", "status");

-- 10. transaction_installments
CREATE TABLE "transaction_installments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "creditCardId" UUID,
    "installmentNumber" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "referenceMonth" VARCHAR(7) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transaction_installments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "transaction_installments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_installments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_installments_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "transaction_installments_userId_referenceMonth_idx" ON "transaction_installments"("userId", "referenceMonth");

-- 11. budgets
CREATE TABLE "budgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "subcategoryId" UUID,
    "referenceMonth" VARCHAR(7) NOT NULL,
    "plannedAmountCents" BIGINT NOT NULL,
    "alert50Sent" BOOLEAN NOT NULL DEFAULT false,
    "alert80Sent" BOOLEAN NOT NULL DEFAULT false,
    "alert100Sent" BOOLEAN NOT NULL DEFAULT false,
    "alertExceededSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "budgets_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "budgets_userId_categoryId_subcategoryId_referenceMonth_key" ON "budgets"("userId", "categoryId", "subcategoryId", "referenceMonth");

-- 12. goals
CREATE TABLE "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "accountId" UUID,
    "name" VARCHAR(120) NOT NULL,
    "targetAmountCents" BIGINT NOT NULL,
    "currentAmountCents" BIGINT NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "recurringContributionCents" BIGINT NOT NULL DEFAULT 0,
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "icon" VARCHAR(40) NOT NULL DEFAULT 'target',
    "color" VARCHAR(20) NOT NULL DEFAULT '#10B981',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goals_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- 13. goal_contributions
CREATE TABLE "goal_contributions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "goalId" UUID NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "contributionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goal_contributions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goal_contributions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_contributions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 14. debts
CREATE TABLE "debts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "creditor" VARCHAR(120) NOT NULL,
    "totalAmountCents" BIGINT NOT NULL,
    "remainingAmountCents" BIGINT NOT NULL,
    "monthlyInterestRateBp" INTEGER NOT NULL,
    "totalInstallments" INTEGER NOT NULL,
    "paidInstallments" INTEGER NOT NULL DEFAULT 0,
    "installmentAmountCents" BIGINT NOT NULL,
    "nextDueDate" TIMESTAMP(3) NOT NULL,
    "status" "DebtStatus" NOT NULL DEFAULT 'ACTIVE',
    "preferredStrategy" "DebtStrategy" NOT NULL DEFAULT 'AVALANCHE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "debts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "debts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "debts_userId_status_idx" ON "debts"("userId", "status");

-- 15. debt_payments
CREATE TABLE "debt_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "debtId" UUID NOT NULL,
    "amountCents" BIGINT NOT NULL,
    "isExtraAmortization" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "debt_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "debt_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "debt_payments_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "debts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 16. notifications
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(140) NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" VARCHAR(255),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "sentByEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt");

-- 17. notification_preferences
CREATE TABLE "notification_preferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'BOTH',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "notification_preferences_userId_type_key" ON "notification_preferences"("userId", "type");

-- 18. attachments
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(80) NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "sha256Checksum" VARCHAR(64) NOT NULL,
    "storageObjectKey" VARCHAR(255) NOT NULL,
    "encryptedMetadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "attachments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "attachments_storageObjectKey_key" ON "attachments"("storageObjectKey");

-- 19. audit_logs
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "resourceType" VARCHAR(60) NOT NULL,
    "resourceId" VARCHAR(64),
    "ipAddressMasked" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(255) NOT NULL,
    "metadataSanitized" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- 20. consent_records
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "purposeCode" VARCHAR(80) NOT NULL,
    "purposeTitle" VARCHAR(160) NOT NULL,
    "policyVersion" VARCHAR(20) NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "ipAddressMasked" VARCHAR(45) NOT NULL,
    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 21. data_export_requests
CREATE TABLE "data_export_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "format" "ExportFormat" NOT NULL DEFAULT 'JSON',
    "status" "ExportStatus" NOT NULL DEFAULT 'COMPLETED',
    "signedDownloadUrl" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "data_export_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 22. security_events
CREATE TABLE "security_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "eventType" VARCHAR(80) NOT NULL,
    "severity" "SecuritySeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "ipAddressMasked" VARCHAR(45) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "security_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "security_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
