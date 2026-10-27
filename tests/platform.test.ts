import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FinancialPlatformStore,
  ForbiddenAccessError,
  AuthenticationError,
  ValidationError,
} from '../src/lib/store/database.ts';
import {
  encryptAtRest,
  decryptAtRest,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  verifySignedAttachmentUrl,
  maskSensitiveStrings,
  sanitizeForAuditLog,
} from '../src/lib/security/crypto.ts';
import {
  generateTotpCode,
  verifyTotpCode,
} from '../src/lib/security/totp.ts';
import {
  validateAttachmentUpload,
  generateCsrfToken,
} from '../src/lib/security/headers-and-guards.ts';
import { formatBRLFromCents, formatDateBR } from '../src/lib/finance/formatters.ts';
import { createAppController } from '../src/server/app-server.ts';
import { supabase as publicSupabaseClient } from '../src/lib/supabase/client.ts';
import { supabaseAdmin } from '../src/lib/supabase/admin.ts';
import { runSecurityRegressionCheck } from '../scripts/security-regression-check.ts';

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

describe('Meu Controle Financeiro — Suíte Completa de Testes (Segurança, Isolamento RLS, Domínio, LGPD e E2E)', () => {
  it('1. Criptografia AES-256-GCM em repouso e Hashing de Senha Argon2id/Scrypt', () => {
    const secretPayload = 'Renda Confidencial: R$ 9.450,00';
    const ciphertext = encryptAtRest(secretPayload);
    assert.notEqual(ciphertext, secretPayload);
    assert.ok(ciphertext.startsWith('v1:'));
    assert.equal(decryptAtRest(ciphertext), secretPayload);

    const weak = validatePasswordStrength('123456');
    assert.equal(weak.valid, false);

    const strong = validatePasswordStrength('SenhaForte@2026!');
    assert.equal(strong.valid, true);

    const hashed = hashPassword('SenhaForte@2026!');
    assert.ok(hashed.startsWith('$argon2id-scrypt$'));
    assert.equal(verifyPassword('SenhaForte@2026!', hashed), true);
    assert.equal(verifyPassword('SenhaErrada@2026!', hashed), false);
  });

  it('2. Cadastro, Confirmação de E-mail, Login, MFA (TOTP RFC 6238) e Bloqueio contra Força Bruta', () => {
    const store = new FinancialPlatformStore();

    assert.throws(() => {
      store.registerUser({
        name: 'Usuário Teste Fictício',
        email: 'usuario.teste@ficticio.local',
        password: ' MinhaSenha@2026! ',
        acceptedTermsAndPrivacy: false,
      });
    }, ValidationError);

    const { user, verificationToken } = store.registerUser({
      name: 'Usuário Teste Fictício',
      email: 'usuario.teste@ficticio.local',
      password: 'MinhaSenha@2026!',
      acceptedTermsAndPrivacy: true,
    });

    assert.equal(user.emailVerified, false);
    assert.equal(store.verifyEmail(verificationToken), true);
    assert.equal(store.users.get(user.id)?.emailVerified, true);

    const mfaSetup = store.setupMfa(user.id);
    const validTotp = generateTotpCode(mfaSetup.secretBase32);
    assert.equal(verifyTotpCode(mfaSetup.secretBase32, validTotp), true);
    assert.equal(store.verifyAndEnableMfa(user.id, validTotp), true);

    const step1 = store.login({
      email: 'usuario.teste@ficticio.local',
      password: 'MinhaSenha@2026!',
    });
    assert.equal(step1.requiresMfa, true);

    const step2 = store.login({
      email: 'usuario.teste@ficticio.local',
      password: 'MinhaSenha@2026!',
      totpCode: validTotp,
    });
    assert.equal(step2.requiresMfa, false);
    assert.ok(step2.accessToken);
    assert.ok(step2.refreshToken);
    assert.equal(step2.session?.mfaVerified, true);

    for (let i = 0; i < 5; i++) {
      assert.throws(() => {
        store.login({
          email: 'usuario.teste@ficticio.local',
          password: 'SenhaIncorreta@999',
        });
      }, AuthenticationError);
    }
    assert.ok(store.users.get(user.id)?.lockedUntil);
  });

  it('3. Recuperação de Senha com Token de Uso Único e Rotação/Revogação de Sessões', () => {
    const store = new FinancialPlatformStore();
    const { user } = store.registerUser({
      name: 'Ana Recuperação [DEMO]',
      email: 'ana@ficticio.local',
      password: 'SenhaAntiga@2026!',
      acceptedTermsAndPrivacy: true,
    });

    const loginRes = store.login({
      email: 'ana@ficticio.local',
      password: 'SenhaAntiga@2026!',
    });
    assert.equal(store.getUserSessions(user.id).length, 1);

    const rotated = store.rotateRefreshToken(loginRes.refreshToken!);
    assert.notEqual(rotated.refreshToken, loginRes.refreshToken);

    const { resetToken } = store.requestPasswordReset('ana@ficticio.local');
    assert.ok(resetToken);

    store.resetPasswordWithToken({
      token: resetToken!,
      newPassword: 'NovaSenhaSuperForte@2026!',
    });

    assert.throws(() => {
      store.resetPasswordWithToken({
        token: resetToken!,
        newPassword: 'OutraSenhaForte@2026!',
      });
    }, ValidationError);

    assert.equal(store.getUserSessions(user.id).length, 0);
  });

  it('4. Gestão de Transações, Parcelamento, Classificação Inteligente e Desfazer Exclusão', () => {
    const store = new FinancialPlatformStore();
    const { user } = store.registerUser({
      name: 'Carlos Finanças [DEMO]',
      email: 'carlos@ficticio.local',
      password: 'SenhaCarlos@2026!',
      acceptedTermsAndPrivacy: true,
    });

    const acc = store.createAccount(user.id, {
      name: 'Conta Principal',
      type: 'CHECKING',
      initialBalanceCents: 500000,
    });

    const { transaction } = store.createTransaction(user.id, {
      type: 'EXPENSE',
      amountCents: 120000,
      occurrenceDate: '2026-10-10T10:00:00.000Z',
      originAccountId: acc.id,
      description: 'Compra Supermercado Exemplo',
      installmentTotal: 3,
      status: 'PAID',
    });

    assert.equal(transaction.autoClassified, true);
    const assignedCat = store.categories.get(transaction.categoryId);
    assert.equal(assignedCat?.slug, 'alimentacao');

    const userInstallments = Array.from(store.installments.values()).filter(
      (i) => i.transactionId === transaction.id
    );
    assert.equal(userInstallments.length, 3);
    assert.equal(
      userInstallments.reduce((s, i) => s + i.amountCents, 0),
      120000
    );

    const { transaction: txEstab } = store.createTransaction(user.id, {
      type: 'EXPENSE',
      amountCents: 8500,
      occurrenceDate: '2026-10-12T10:00:00.000Z',
      description: 'Padaria EstrelaBela Artesanal',
    });
    const lazerCat = Array.from(store.categories.values()).find(
      (c) => c.userId === user.id && c.slug === 'lazer'
    )!;
    store.updateTransaction(user.id, txEstab.id, { categoryId: lazerCat.id });

    const { transaction: txLearned } = store.createTransaction(user.id, {
      type: 'EXPENSE',
      amountCents: 9200,
      occurrenceDate: '2026-10-19T10:00:00.000Z',
      description: 'Padaria EstrelaBela Café',
    });
    assert.equal(txLearned.categoryId, lazerCat.id);

    const countBefore = store.getUserTransactions(user.id).length;
    store.softDeleteTransaction(user.id, txLearned.id);
    assert.equal(store.getUserTransactions(user.id).length, countBefore - 1);

    store.undoDeleteTransaction(user.id, txLearned.id);
    assert.equal(store.getUserTransactions(user.id).length, countBefore);
  });

  it('5. [SEGURANÇA OBRIGATÓRIA] Isolamento Estrito entre Usuário A e Usuário B em Todas as Entidades e Endpoints', async () => {
    const store = new FinancialPlatformStore();
    const controller = createAppController(store, {
      requireExplicitSessionCookie: true,
    });

    const { user: userA } = store.registerUser({
      name: 'Usuária A',
      email: 'usera@ficticio.local',
      password: 'SenhaUserA@2026!',
      acceptedTermsAndPrivacy: true,
    });
    const { user: userB } = store.registerUser({
      name: 'Usuário B',
      email: 'userb@ficticio.local',
      password: 'SenhaUserB@2026!',
      acceptedTermsAndPrivacy: true,
    });

    const loginA = store.login({
      email: 'usera@ficticio.local',
      password: 'SenhaUserA@2026!',
    });
    const loginB = store.login({
      email: 'userb@ficticio.local',
      password: 'SenhaUserB@2026!',
    });

    const headersA = {
      Authorization: `Bearer ${loginA.accessToken}`,
      'X-CSRF-Token': generateCsrfToken(loginA.session!.id),
      'Content-Type': 'application/json',
    };
    const headersB = {
      Authorization: `Bearer ${loginB.accessToken}`,
      'X-CSRF-Token': generateCsrfToken(loginB.session!.id),
      'Content-Type': 'application/json',
    };

    // Usuário B cria conta, cartão, orçamento, meta, transação e anexo privados
    const accB = store.createAccount(userB.id, {
      name: 'Conta Secreta do Usuário B',
      type: 'CHECKING',
      initialBalanceCents: 900000,
    });
    const cardB = store.createCreditCard(userB.id, {
      name: 'Cartão Black Usuário B',
      totalLimitCents: 2500000,
      closingDay: 15,
      dueDay: 22,
    });
    const catB = Array.from(store.categories.values()).find(
      (c) => c.userId === userB.id && c.slug === 'alimentacao'
    )!;
    const budgetB = store.upsertBudget(userB.id, {
      categoryId: catB.id,
      referenceMonth: '2026-10',
      plannedAmountCents: 180000,
    });
    const goalB = store.createGoal(userB.id, {
      name: 'Meta Privada do Usuário B',
      targetAmountCents: 5000000,
      recurringContributionCents: 200000,
      targetDate: '2027-12-31T00:00:00.000Z',
    });
    const { transaction: txB } = store.createTransaction(userB.id, {
      type: 'EXPENSE',
      amountCents: 75000,
      occurrenceDate: '2026-10-15T10:00:00.000Z',
      description: 'Despesa Confidencial do Usuário B',
      originAccountId: accB.id,
    });
    const attB = store.createAttachment(userB.id, {
      transactionId: txB.id,
      fileName: 'recibo-privado-b.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 1024,
      sha256Checksum: 'a'.repeat(64),
    });

    // 5.1 Usuário A não consegue listar transações, contas, cartões, orçamentos, metas ou anexos do Usuário B
    assert.equal(store.getUserTransactions(userA.id).length, 0);
    assert.equal(store.getUserAccounts(userA.id).length, 0);
    assert.equal(store.getUserCreditCardsWithSummary(userA.id).length, 0);
    assert.equal(store.getUserBudgets(userA.id).length, 0);
    assert.equal(store.getUserGoals(userA.id).length, 0);
    assert.equal(store.getUserAttachments(userA.id).length, 0);

    for (const endpoint of [
      '/api/v1/transactions',
      '/api/v1/accounts',
      '/api/v1/credit-cards',
      '/api/v1/budgets',
      '/api/v1/goals',
      '/api/v1/attachments',
    ]) {
      const resA = await controller.dispatch({
        method: 'GET',
        url: endpoint,
        headers: headersA,
      });
      assert.equal(resA.status, 200);
      assert.deepEqual(JSON.parse(resA.body), []);
    }

    // 5.2 Usuário A não consegue editar ou excluir dados do Usuário B (retorna 403 Forbidden)
    const crossTenantAttempts = [
      { method: 'PUT', url: `/api/v1/transactions/${txB.id}`, body: { description: 'Hack' } },
      { method: 'DELETE', url: `/api/v1/transactions/${txB.id}` },
      { method: 'PUT', url: `/api/v1/accounts/${accB.id}`, body: { name: 'Hack' } },
      { method: 'DELETE', url: `/api/v1/accounts/${accB.id}` },
      { method: 'PUT', url: `/api/v1/credit-cards/${cardB.id}`, body: { name: 'Hack' } },
      { method: 'DELETE', url: `/api/v1/credit-cards/${cardB.id}` },
      { method: 'PUT', url: `/api/v1/budgets/${budgetB.id}`, body: { plannedAmountCents: 1 } },
      { method: 'DELETE', url: `/api/v1/budgets/${budgetB.id}` },
      { method: 'PUT', url: `/api/v1/goals/${goalB.id}`, body: { name: 'Hack' } },
      { method: 'DELETE', url: `/api/v1/goals/${goalB.id}` },
      { method: 'DELETE', url: `/api/v1/attachments/${attB.id}` },
      { method: 'GET', url: attB.signedUrl },
    ];

    for (const attempt of crossTenantAttempts) {
      const resp = await controller.dispatch({
        method: attempt.method,
        url: attempt.url,
        headers: headersA,
        body: attempt.body,
      });
      assert.equal(
        resp.status,
        403,
        `Esperava 403 Forbidden ao tentar ${attempt.method} ${attempt.url} com Usuário A`
      );
    }

    // 5.3 Usuário A também não consegue criar transação injetando userId do Usuário B
    const forgedWrite = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/transactions',
      headers: headersA,
      body: {
        userId: userB.id,
        description: 'Injeção de userId alheio',
        amountCents: 5000,
      },
    });
    assert.equal(forgedWrite.status, 403);

    // Enquanto isso, o próprio Usuário B acessa normalmente seu comprovante privado
    const validDownloadB = await controller.dispatch({
      method: 'GET',
      url: attB.signedUrl,
      headers: headersB,
    });
    assert.equal(validDownloadB.status, 200);
    assert.equal(JSON.parse(validDownloadB.body).bucketPrivate, true);
  });

  it('6. [SEGURANÇA OBRIGATÓRIA] Usuário Não Autenticado Não Consegue Acessar Dados Financeiros (401)', async () => {
    const store = new FinancialPlatformStore();
    const controller = createAppController(store, {
      requireExplicitSessionCookie: true,
    });

    const protectedEndpoints = [
      { method: 'GET', url: '/api/v1/state' },
      { method: 'GET', url: '/api/v1/transactions' },
      { method: 'POST', url: '/api/v1/transactions' },
      { method: 'GET', url: '/api/v1/accounts' },
      { method: 'GET', url: '/api/v1/credit-cards' },
      { method: 'GET', url: '/api/v1/budgets' },
      { method: 'GET', url: '/api/v1/goals' },
      { method: 'GET', url: '/api/v1/attachments' },
      { method: 'GET', url: '/api/v1/privacy/export' },
    ];

    for (const ep of protectedEndpoints) {
      // Sem cookie / token
      const unauthRes = await controller.dispatch({
        method: ep.method,
        url: ep.url,
      });
      assert.equal(
        unauthRes.status,
        401,
        `Endpoint ${ep.method} ${ep.url} deveria bloquear acesso não autenticado com 401`
      );

      // Com Bearer token inválido
      const badTokenRes = await controller.dispatch({
        method: ep.method,
        url: ep.url,
        headers: { Authorization: 'Bearer token_invalido_123' },
      });
      assert.equal(badTokenRes.status, 401);
    }
  });

  it('7. [SEGURANÇA OBRIGATÓRIA] Buckets Privados, Clientes Supabase Separados e Ausência Total de Secret Key no Frontend/APIs/Logs', async () => {
    const store = new FinancialPlatformStore();
    const controller = createAppController(store);

    // 7.1 Verifica que o bucket de comprovantes é estritamente privado
    const bucketConfig = store.getStorageBucketConfig();
    assert.equal(bucketConfig.bucketName, 'mcf-private-attachments');
    assert.equal(bucketConfig.public, false);
    assert.equal(bucketConfig.rlsEnforced, true);

    // 7.2 Verifica separação entre cliente público e cliente administrativo do servidor
    assert.ok(publicSupabaseClient);
    assert.ok(supabaseAdmin);
    assert.equal(supabaseAdmin.auth.options.autoRefreshToken, false);
    assert.equal(supabaseAdmin.auth.options.persistSession, false);

    // 7.3 Verifica que o bundle/HTML do frontend (GET /) não contém nenhuma chave secreta nem formulário de configuração do Supabase
    const homeRes = await controller.dispatch({ method: 'GET', url: '/' });
    assert.equal(homeRes.status, 200);

    const forbiddenFrontendStrings = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'SUPABASE_SECRET_KEY',
      'sb_secret_',
      'service_role',
      'Service Role Key',
      'sb-key-input',
      'sb-url-input',
      'sync-supabase',
      'Sincronização com Supabase Cloud',
    ];
    for (const forbidden of forbiddenFrontendStrings) {
      assert.equal(
        homeRes.body.includes(forbidden),
        false,
        `O HTML/bundle do frontend NÃO pode conter '${forbidden}'`
      );
    }

    // 7.4 Verifica que /api/v1/state e /api/v1/health não retornam chaves ou variáveis de ambiente
    const stateRes = await controller.dispatch({ method: 'GET', url: '/api/v1/state' });
    assert.equal(stateRes.status, 200);
    const stateJson = JSON.parse(stateRes.body);
    assert.equal('supabase' in stateJson, false);
    for (const forbidden of forbiddenFrontendStrings) {
      assert.equal(stateRes.body.includes(forbidden), false);
    }

    // 7.5 Verifica que a antiga rota pública /api/v1/supabase/sync está bloqueada com 403
    const legacySyncRes = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/supabase/sync',
      body: {
        supabaseUrl: 'https://malicioso.supabase.co',
        supabaseKey: 'sb_secret_test',
      },
    });
    assert.equal(legacySyncRes.status, 403);

    // 7.6 Verifica mascaramento de segredos em logs e mensagens de erro
    const rawErrorWithSecrets =
      'Falha ao conectar usando SUPABASE_SECRET_KEY=sb_secret_987654321abcdef e Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.assinatura';
    const masked = maskSensitiveStrings(rawErrorWithSecrets);
    assert.equal(masked.includes('sb_secret_987654321abcdef'), false);
    assert.equal(masked.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'), false);
    assert.ok(masked.includes('[REDACTED'));

    const auditSanitized = sanitizeForAuditLog({
      action: 'TEST',
      supabaseKey: 'sb_secret_12345',
      service_role: 'secret',
    });
    assert.equal(auditSanitized.includes('sb_secret_12345'), false);
    assert.ok(auditSanitized.includes('[REDACTED]'));
  });

  it('8. [SEGURANÇA OBRIGATÓRIA] Verificação de Regressão CI/Build e Políticas RLS em Todas as Tabelas de Usuários', () => {
    const regressionCheck = runSecurityRegressionCheck(PROJECT_ROOT);
    assert.equal(
      regressionCheck.passed,
      true,
      `Falhas encontradas pelo verificador de regressão: ${regressionCheck.violations.join('; ')}`
    );

    const migrationPath = path.join(
      PROJECT_ROOT,
      'prisma/migrations/20261026000100_enable_granular_rls/migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    const mandatoryUserTables = [
      'profiles',
      'accounts',
      'cards',
      'transactions',
      'categories',
      'budgets',
      'goals',
      'debts',
      'notifications',
      'attachments',
      'audit_logs',
    ];

    for (const table of mandatoryUserTables) {
      assert.match(
        sql,
        new RegExp(`ALTER\\s+TABLE\\s+public\\."${table}"\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i'),
        `RLS deve estar habilitada na tabela ${table}`
      );
      assert.match(
        sql,
        new RegExp(`REVOKE\\s+ALL\\s+ON\\s+public\\."${table}"\\s+FROM\\s+anon`, 'i'),
        `Acesso anônimo deve ser revogado na tabela ${table}`
      );
    }

    // Verifica que o script cliente embutido na página principal possui sintaxe JS válida
    const store = new FinancialPlatformStore();
    const controller = createAppController(store);
    return controller.dispatch({ method: 'GET', url: '/' }).then((homeRes) => {
      const scriptMatch = homeRes.body.match(
        /<script id="app-client-script">([\s\S]*?)<\/script>/
      );
      assert.ok(scriptMatch && scriptMatch[1]);
      assert.doesNotThrow(() => {
        new Function(scriptMatch[1]);
      });
      assert.ok(formatBRLFromCents(123456).includes('1.234,56'));
      assert.equal(formatDateBR('2026-10-26T12:00:00.000Z'), '26/10/2026');
    });
  });

  it('9. Validação de Magic Bytes de Comprovantes e Portabilidade/Exclusão LGPD', () => {
    const store = new FinancialPlatformStore();
    const { user } = store.registerUser({
      name: 'Titular LGPD [DEMO]',
      email: 'lgpd@ficticio.local',
      password: 'SenhaLgpd@2026!',
      acceptedTermsAndPrivacy: true,
    });

    const { transaction } = store.createTransaction(user.id, {
      type: 'EXPENSE',
      amountCents: 19900,
      occurrenceDate: '2026-10-20T10:00:00.000Z',
      description: 'Compra com Comprovante PDF',
    });

    const fakePdf = Buffer.from('MZ-executable-malware-content');
    const invalidCheck = validateAttachmentUpload({
      fileName: 'comprovante.pdf',
      mimeType: 'application/pdf',
      sizeBytes: fakePdf.length,
      contentBuffer: fakePdf,
    });
    assert.equal(invalidCheck.valid, false);

    const validPdf = Buffer.from('%PDF-1.7 Comprovante Ficticio');
    const validCheck = validateAttachmentUpload({
      fileName: 'comprovante.pdf',
      mimeType: 'application/pdf',
      sizeBytes: validPdf.length,
      contentBuffer: validPdf,
    });
    assert.equal(validCheck.valid, true);

    const attachment = store.createAttachment(user.id, {
      transactionId: transaction.id,
      fileName: 'comprovante.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: validPdf.length,
      sha256Checksum: validCheck.sha256Checksum!,
    });
    assert.ok(attachment.signedUrl.includes('sig='));

    const exported = store.exportAllPersonalDataLGPD(user.id, 'JSON');
    assert.equal(exported.requestRecord.status, 'COMPLETED');

    const deletion = store.requestAccountDeletion(user.id, true);
    assert.equal(deletion.purgedImmediately, true);
    assert.equal(store.users.has(user.id), false);
  });

  it('10. Fluxo completo de Usuário Final: Criar Conta, Login, Recuperar Senha e Logout via API HTTP', async () => {
    const store = new FinancialPlatformStore();
    const controller = createAppController(store);

    // 1. Acessa home sem cookie -> tela de login visível
    const homeAnon = await controller.dispatch({ method: 'GET', url: '/' });
    assert.equal(homeAnon.status, 200);
    assert.ok(homeAnon.body.includes('id="auth-screen-overlay"'));
    assert.ok(homeAnon.body.includes('style="display: flex;"'));

    // 2. Cria uma conta nova pelo endpoint de cadastro
    const regRes = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/auth/register',
      body: {
        name: 'Maria Clara Silva',
        email: 'maria.clara@exemplo.com',
        password: 'SenhaForte@2026',
        acceptedTermsAndPrivacy: true,
      },
    });
    assert.equal(regRes.status, 201);
    const regData = JSON.parse(regRes.body);
    assert.equal(regData.authenticated, true);
    assert.equal(regData.state.user.email, 'maria.clara@exemplo.com');
    const setCookieHeader = regRes.headers['Set-Cookie'] || '';
    assert.ok(setCookieHeader.includes('mcf_session='));
    assert.ok(setCookieHeader.includes('mcf_vault='));

    // 3. Redefine a senha e faz login com a nova senha
    const resetRes = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      body: {
        email: 'maria.clara@exemplo.com',
        newPassword: 'NovaSenhaSuper@2026',
      },
    });
    assert.equal(resetRes.status, 200);

    const loginRes = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/auth/login',
      body: {
        email: 'maria.clara@exemplo.com',
        password: 'NovaSenhaSuper@2026',
      },
    });
    assert.equal(loginRes.status, 200);
    const loginData = JSON.parse(loginRes.body);
    assert.equal(loginData.authenticated, true);

    // 4. Logout limpa a sessão
    const logoutRes = await controller.dispatch({
      method: 'POST',
      url: '/api/v1/auth/logout',
    });
    assert.equal(logoutRes.status, 200);
  });
});
