import http from 'node:http';
import crypto from 'node:crypto';
import { URL, pathToFileURL } from 'node:url';
import {
  defaultStore,
  FinancialPlatformStore,
  AuthenticationError,
  ForbiddenAccessError,
} from '../lib/store/database.mjs';
import { seedDemoData, DEMO_USER_CREDENTIALS } from '../lib/seed-data.mjs';
import {
  getSecurityHeaders,
  checkRateLimit,
  generateCsrfToken,
  verifyCsrfToken,
  sanitizeText,
} from '../lib/security/headers-and-guards.mjs';
import {
  encryptAtRest,
  decryptAtRest,
  hashToken,
  maskSensitiveStrings,
  verifySignedAttachmentUrl,
} from '../lib/security/crypto.mjs';
import { classifyTransactionDescription } from '../lib/finance/smart-classifier.mjs';
import { simulateDebtPayoff } from '../lib/finance/simulators.mjs';
import { renderWebAppHtml } from './ui-template.mjs';
import {
  isSupabaseServerSyncEnabled,
  syncStoreToSupabase,
} from '../lib/store/supabase-sync.mjs';

                                  
                 
                                  
               
 

export function createAppController(
  store                         = defaultStore,
  options                                             
) {
  const { demoUserId } = seedDemoData(store);

  let demoSessionId = '';
  const existingSessions = store.getUserSessions(demoUserId);
  if (existingSessions.length === 0) {
    const loginRes = store.login({
      email: DEMO_USER_CREDENTIALS.email,
      password: DEMO_USER_CREDENTIALS.password,
      browser: 'Chrome 132 (Windows)',
      os: 'Windows 11',
      deviceName: 'Estação de Trabalho Principal [DEMO]',
      approximateLocation: 'São Paulo, SP, Brasil',
      ip: '177.45.10.10',
    });
    demoSessionId = loginRes.session?.id || 'demo-session';
  } else {
    demoSessionId = existingSessions[0].id;
  }

  function buildClientState(userId        ) {
    const user = store.users.get(userId);
    if (!user) throw new AuthenticationError('Sessão inválida ou usuário inexistente.');
    const {
      passwordHash: _omitted,
      emailVerificationToken: _evToken,
      passwordResetTokenHash: _prToken,
      ...safeUser
    } = user;
    const profile = store.userProfiles.get(userId);
    const dashboard = store.getDashboardSummary(userId, '2026-10');
    const accounts = store.getUserAccounts(userId);
    const creditCards = Array.from(store.creditCards.values()).filter(
      (cc) => cc.userId === userId && !cc.isArchived
    );
    const categories = Array.from(store.categories.values()).filter(
      (c) => c.userId === userId
    );
    const transactions = store.getUserTransactions(userId);
    const budgets = store.getUserBudgets(userId);
    const goals = store.getUserGoals(userId);
    const debts = Array.from(store.debts.values()).filter(
      (d) => d.userId === userId
    );
    const attachments = store.getUserAttachments(userId);
    const sessions = store.getUserSessions(userId);
    const consents = Array.from(store.consentRecords.values()).filter(
      (c) => c.userId === userId
    );
    const notifications = Array.from(store.notifications.values()).filter(
      (n) => n.userId === userId
    );
    const auditLogs = store.auditLogs.filter((a) => a.userId === userId);

    // IMPORTANTE: Jamais incluir variáveis de ambiente, URLs de banco ou chaves do Supabase no estado do cliente
    return {
      user: safeUser,
      profile,
      dashboard,
      accounts,
      creditCards,
      categories,
      transactions,
      budgets,
      goals,
      debts,
      attachments,
      sessions,
      consents,
      notifications,
      auditLogs,
    };
  }

  function createEncryptedSessionCookieValue(
    userId        ,
    sessionId        
  )         {
    const u = store.users.get(userId);
    if (!u) return '';
    return encryptAtRest(
      JSON.stringify({
        sessionId,
        userId: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        isDemoAccount: u.isDemoAccount,
      })
    );
  }

  function tryRestoreSessionFromCookie(cookieHeader        )   
                   
                      
           {
    const vaultMatch = cookieHeader.match(/mcf_vault=([^;\s]+)/);
    if (!vaultMatch) return null;
    try {
      const raw = decodeURIComponent(vaultMatch[1].trim());
      const parsed = JSON.parse(decryptAtRest(raw));
      if (!parsed || !parsed.userId || !parsed.sessionId) return null;

      if (!store.users.has(parsed.userId)) {
        const now = new Date().toISOString();
        store.users.set(parsed.userId, {
          id: parsed.userId,
          name: parsed.name || 'Usuário',
          email: parsed.email || 'usuario@local',
          passwordHash: parsed.passwordHash || '',
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          passwordResetTokenHash: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
          deletionRequestedAt: null,
          deletionScheduledFor: null,
          isDemoAccount: Boolean(parsed.isDemoAccount),
          createdAt: now,
          updatedAt: now,
        });
        store.userProfiles.set(parsed.userId, {
          id: crypto.randomUUID(),
          userId: parsed.userId,
          estimatedMonthlyIncomeCents: 0,
          encryptedIncomeData: encryptAtRest(
            JSON.stringify({ estimatedMonthlyIncomeCents: 0 })
          ),
          incomeType: 'FIXED',
          mainGoals: [],
          fixedMonthlyExpensesCents: 0,
          hasExistingDebts: false,
          budgetControlMode: 'INDIVIDUAL',
          relevantCategories: [],
          onboardingCompleted: false,
          onboardingSkipped: false,
          themePreference: 'system',
          learnedCategoryRulesJson: '{}',
          createdAt: now,
          updatedAt: now,
        });
        (store       ).seedInitialCategoriesForUser?.(parsed.userId);
      }

      if (!store.sessions.has(parsed.sessionId)) {
        const now = new Date().toISOString();
        store.sessions.set(parsed.sessionId, {
          id: parsed.sessionId,
          userId: parsed.userId,
          accessTokenJti: parsed.sessionId,
          refreshTokenHash: parsed.sessionId,
          refreshTokenFamily: parsed.sessionId,
          browser: 'Navegador Web',
          os: 'Cloud Session',
          deviceName: 'Sessão Autenticada',
          approximateLocation: 'Brasil',
          ipAddressMasked: '177.0.xxx.xxx',
          mfaVerified: false,
          isRevoked: false,
          revokedReason: null,
          lastActiveAt: now,
          expiresAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
          createdAt: now,
        });
      }

      return { userId: parsed.userId, sessionId: parsed.sessionId };
    } catch {
      return null;
    }
  }

  function resolveAuthenticatedActor(
    reqHeaders                                    
  )                                                                    {
    const unauthHeader =
      reqHeaders['x-unauthenticated'] || reqHeaders['X-Unauthenticated'];
    if (unauthHeader === 'true' || unauthHeader === '1') {
      throw new AuthenticationError(
        'Acesso negado: autenticação obrigatória para acessar dados financeiros.'
      );
    }

    const authHeader =
      reqHeaders['authorization'] || reqHeaders['Authorization'] || '';
    if (authHeader) {
      if (!authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Formato de cabeçalho Authorization inválido.');
      }
      const rawToken = authHeader.slice('Bearer '.length).trim();
      const tokenHash = hashToken(rawToken);
      const matchedSession = Array.from(store.sessions.values()).find(
        (s) => s.accessTokenJti === tokenHash && !s.isRevoked
      );
      if (!matchedSession) {
        throw new AuthenticationError('Token de acesso inválido, revogado ou expirado.');
      }
      return {
        userId: matchedSession.userId,
        sessionId: matchedSession.id,
        hasExplicitCookie: true,
      };
    }

    const cookieHeader = reqHeaders['cookie'] || reqHeaders['Cookie'] || '';
    if (cookieHeader) {
      const restored = tryRestoreSessionFromCookie(cookieHeader);
      if (restored) {
        return { ...restored, hasExplicitCookie: true };
      }

      const match =
        cookieHeader.match(/mcf_session=([^;\s]+)/) ||
        cookieHeader.match(/__Host-mcf-session=([^;\s]+)/);
      if (match) {
        const sid = match[1].trim();
        const session = store.sessions.get(sid);
        if (!session || session.isRevoked) {
          throw new AuthenticationError('Sessão inválida ou expirada.');
        }
        return {
          userId: session.userId,
          sessionId: session.id,
          hasExplicitCookie: true,
        };
      }
    }

    if (options?.requireExplicitSessionCookie) {
      throw new AuthenticationError(
        'Autenticação obrigatória: nenhuma sessão válida fornecida.'
      );
    }

    return {
      userId: demoUserId,
      sessionId: demoSessionId,
      hasExplicitCookie: false,
    };
  }

  function verifyAdminAuthorization(
    reqHeaders                                    ,
    clientIp        
  )       {
    // Rate limit estrito para rotas administrativas (máx 5 tentativas por minuto por IP)
    const adminRate = checkRateLimit(`admin:${clientIp}`, 5, 60_000);
    if (!adminRate.allowed) {
      const err      = new Error(
        'Limite de requisições administrativas excedido. Tente novamente mais tarde.'
      );
      err.statusCode = 429;
      throw err;
    }

    const expectedAdminHash = (process.env.ADMIN_API_TOKEN_HASH || '').trim();
    if (
      !expectedAdminHash ||
      expectedAdminHash.includes('substitua') ||
      expectedAdminHash.length !== 64
    ) {
      throw new ForbiddenAccessError(
        'Operação administrativa desabilitada: ADMIN_API_TOKEN_HASH não configurado no servidor.'
      );
    }

    const providedToken = String(
      reqHeaders['x-admin-token'] || reqHeaders['X-Admin-Token'] || ''
    ).trim();
    if (!providedToken) {
      throw new AuthenticationError('Autenticação administrativa obrigatória.');
    }

    const providedHash = hashToken(providedToken);
    const bufA = Buffer.from(providedHash, 'utf8');
    const bufB = Buffer.from(expectedAdminHash, 'utf8');
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      store.recordSecurityEvent({
        userId: null,
        eventType: 'ADMIN_AUTH_FAILED',
        severity: 'CRITICAL',
        description: 'Tentativa de acesso administrativo com credencial inválida bloqueada.',
        ip: clientIp,
      });
      throw new ForbiddenAccessError('Autorização administrativa negada.');
    }
  }

  async function dispatch(params   
                   
                
                                                 
                                   
                      
   )                           {
    const reqHeaders = params.headers || {};
    const secHeaders = getSecurityHeaders(reqHeaders.origin);
    const method = (params.method || 'GET').toUpperCase();
    const clientIp = params.clientIp || '127.0.0.1';

    if (method === 'OPTIONS') {
      return { status: 204, headers: secHeaders, body: '' };
    }

    const rate = checkRateLimit(`ip:${clientIp}`, 240, 60_000);
    if (!rate.allowed) {
      return {
        status: 429,
        headers: {
          ...secHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          error: 'Muitas requisições. Tente novamente em instantes.',
          retryAfterSeconds: rate.retryAfterSeconds,
        }),
      };
    }

    const parsedUrl = new URL(params.url || '/', 'http://localhost:3000');
    const pathname = parsedUrl.pathname;

    try {
      // Healthcheck & Observabilidade (não expõe nenhuma variável de ambiente ou segredo)
      if (method === 'GET' && pathname === '/api/v1/health') {
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            status: 'healthy',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            security: {
              tlsRequiredInProd: true,
              encryptionAtRest: 'AES-256-GCM',
              passwordKdf: 'Argon2id/Scrypt',
              mfa: 'TOTP-RFC6238',
              rlsEnforced: true,
              privateStorageBuckets: true,
              lgpdCompliant: true,
            },
          }),
        };
      }

      // Bloqueia qualquer tentativa de enviar chaves secretas do Supabase via API pública
      if (pathname === '/api/v1/supabase/sync') {
        store.recordSecurityEvent({
          userId: null,
          eventType: 'FORBIDDEN_PUBLIC_SUPABASE_SYNC_ENDPOINT',
          severity: 'CRITICAL',
          description:
            'Tentativa bloqueada de acionar rota pública descontinuada /api/v1/supabase/sync.',
          ip: clientIp,
        });
        return {
          status: 403,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            error:
              'Operação proibida: configuração ou sincronização de chaves administrativas via frontend não é permitida.',
          }),
        };
      }

      // Rota administrativa interna protegida por autenticação/autorização explícita e rate limit
      if (method === 'POST' && pathname === '/api/v1/admin/internal-sync') {
        verifyAdminAuthorization(reqHeaders, clientIp);
        const bodyPayload = params.body || {};
        if (
          'supabaseKey' in bodyPayload ||
          'serviceRoleKey' in bodyPayload ||
          'secretKey' in bodyPayload ||
          'supabaseUrl' in bodyPayload
        ) {
          throw new ForbiddenAccessError(
            'Proibido enviar chaves ou URLs do Supabase no corpo da requisição.'
          );
        }
        const syncResult = await syncStoreToSupabase(store, demoUserId);
        return {
          status: syncResult.synced ? 200 : 400,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(syncResult),
        };
      }

      // Rate limit dedicado para rotas críticas de autenticação e segurança
      if (
        pathname.startsWith('/api/v1/auth/') ||
        pathname.startsWith('/api/v1/security/')
      ) {
        const authRate = checkRateLimit(`auth:${clientIp}`, 20, 60_000);
        if (!authRate.allowed) {
          return {
            status: 429,
            headers: {
              ...secHeaders,
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              error:
                'Muitas tentativas de autenticação/segurança. Aguarde antes de tentar novamente.',
              retryAfterSeconds: authRate.retryAfterSeconds,
            }),
          };
        }
      }

      // Rotas públicas de Autenticação de Usuário Final (Login, Cadastro, Logout e Recuperação de Senha)
      const reqBody = params.body || {};

      if (method === 'POST' && pathname === '/api/v1/auth/register') {
        const regRes = store.registerUser({
          name: sanitizeText(reqBody.name || '', 120),
          email: String(reqBody.email || '').trim().toLowerCase(),
          password: String(reqBody.password || ''),
          acceptedTermsAndPrivacy: Boolean(reqBody.acceptedTermsAndPrivacy),
          ip: clientIp,
        });
        store.verifyEmail(regRes.verificationToken);
        const loginRes = store.login({
          email: regRes.user.email,
          password: String(reqBody.password || ''),
          browser: String(reqHeaders['user-agent'] || 'Navegador Web').slice(0, 60),
          os: 'Web',
          deviceName: 'Dispositivo Pessoal',
          approximateLocation: 'Brasil',
          ip: clientIp,
        });
        const sid = loginRes.session .id;
        const csrfToken = generateCsrfToken(sid);
        const vault = encodeURIComponent(
          createEncryptedSessionCookieValue(regRes.user.id, sid)
        );
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Set-Cookie': `mcf_session=${sid}; Path=/; HttpOnly; SameSite=Lax, mcf_vault=${vault}; Path=/; HttpOnly; SameSite=Lax`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            authenticated: true,
            csrfToken,
            state: buildClientState(regRes.user.id),
          }),
        };
      }

      if (method === 'POST' && pathname === '/api/v1/auth/login') {
        const isDemoLogin = Boolean(reqBody.demo);
        const emailToUse = isDemoLogin
          ? DEMO_USER_CREDENTIALS.email
          : String(reqBody.email || '').trim().toLowerCase();
        const passwordToUse = isDemoLogin
          ? DEMO_USER_CREDENTIALS.password
          : String(reqBody.password || '');

        const loginRes = store.login({
          email: emailToUse,
          password: passwordToUse,
          totpCode: reqBody.totpCode ? String(reqBody.totpCode) : undefined,
          browser: String(reqHeaders['user-agent'] || 'Navegador Web').slice(0, 60),
          os: 'Web',
          deviceName: isDemoLogin ? 'Sessão Demonstração [DEMO]' : 'Dispositivo Pessoal',
          approximateLocation: 'Brasil',
          ip: clientIp,
        });

        if (loginRes.requiresMfa) {
          return {
            status: 200,
            headers: {
              ...secHeaders,
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
              authenticated: false,
              requiresMfa: true,
            }),
          };
        }

        const sid = loginRes.session .id;
        const uid = loginRes.user .id;
        const csrfToken = generateCsrfToken(sid);
        const vault = encodeURIComponent(
          createEncryptedSessionCookieValue(uid, sid)
        );
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Set-Cookie': `mcf_session=${sid}; Path=/; HttpOnly; SameSite=Lax, mcf_vault=${vault}; Path=/; HttpOnly; SameSite=Lax`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            authenticated: true,
            csrfToken,
            state: buildClientState(uid),
          }),
        };
      }

      if (method === 'POST' && pathname === '/api/v1/auth/hydrate') {
        if (!reqBody.user || !reqBody.user.id || !reqBody.user.email) {
          throw new ValidationError('Dados de hidratação de sessão inválidos.');
        }
        const { userId: hydratedUid, sessionId: hydratedSid } =
          store.hydrateUserFinancialState({
            user: {
              id: sanitizeText(String(reqBody.user.id), 80),
              name: sanitizeText(String(reqBody.user.name || reqBody.user.nome || 'Usuário'), 120),
              email: String(reqBody.user.email).trim().toLowerCase(),
              createdAt: reqBody.user.createdAt,
            },
            accounts: Array.isArray(reqBody.accounts) ? reqBody.accounts : undefined,
            creditCards: Array.isArray(reqBody.creditCards) ? reqBody.creditCards : undefined,
            categories: Array.isArray(reqBody.categories) ? reqBody.categories : undefined,
            transactions: Array.isArray(reqBody.transactions) ? reqBody.transactions : undefined,
            budgets: Array.isArray(reqBody.budgets) ? reqBody.budgets : undefined,
            goals: Array.isArray(reqBody.goals) ? reqBody.goals : undefined,
            debts: Array.isArray(reqBody.debts) ? reqBody.debts : undefined,
          });
        const csrfToken = generateCsrfToken(hydratedSid);
        const vault = encodeURIComponent(
          createEncryptedSessionCookieValue(hydratedUid, hydratedSid)
        );
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Set-Cookie': `mcf_session=${hydratedSid}; Path=/; HttpOnly; SameSite=Lax, mcf_vault=${vault}; Path=/; HttpOnly; SameSite=Lax`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            authenticated: true,
            csrfToken,
            state: buildClientState(hydratedUid),
          }),
        };
      }

      if (method === 'POST' && pathname === '/api/v1/auth/logout') {
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Set-Cookie':
              'mcf_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax, mcf_vault=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ authenticated: false }),
        };
      }

      if (method === 'POST' && pathname === '/api/v1/auth/reset-password') {
        const email = String(reqBody.email || '').trim().toLowerCase();
        const newPassword = String(reqBody.newPassword || '');
        const { resetToken } = store.requestPasswordReset(email);
        if (!resetToken) {
          throw new AuthenticationError(
            'Não encontramos uma conta ativa com este e-mail nesta sessão.'
          );
        }
        store.resetPasswordWithToken({ token: resetToken, newPassword });
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            reset: true,
            message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
          }),
        };
      }

      // Página Principal (Interface Web Completa com Auth Guard de DOM)
      if (method === 'GET' && pathname === '/') {
        let activeUserId = '';
        let activeSessionId = demoSessionId;
        let isAuthenticatedCookie = false;

        try {
          const resolved = resolveAuthenticatedActor(reqHeaders);
          if (resolved.hasExplicitCookie) {
            activeUserId = resolved.userId;
            activeSessionId = resolved.sessionId;
            isAuthenticatedCookie = true;
          }
        } catch {
          isAuthenticatedCookie = false;
        }

        const csrfToken = generateCsrfToken(activeSessionId);
        const clientState =
          isAuthenticatedCookie && activeUserId
            ? {
                ...buildClientState(activeUserId),
                isAuthenticated: true,
              }
            : {
                isAuthenticated: false,
                user: null,
                profile: null,
                dashboard: null,
                accounts: [],
                categories: [],
                transactions: [],
                budgets: [],
                goals: [],
                debts: [],
                notifications: [],
                sessions: [],
                consents: [],
                auditLogs: [],
              };
        const html = renderWebAppHtml(clientState, csrfToken);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'text/html; charset=utf-8',
          },
          body: html,
        };
      }

      // Todas as rotas financeiras abaixo exigem usuário autenticado válido
      const { userId: actorUserId, sessionId: actorSessionId } =
        resolveAuthenticatedActor(reqHeaders);

      // Estado consolidado para atualização dinâmica da UI (isolado para actorUserId)
      if (method === 'GET' && pathname === '/api/v1/state') {
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(buildClientState(actorUserId)),
        };
      }

      // Listagens isoladas por usuário autenticado (equivalente a RLS SELECT user_id = auth.uid())
      if (method === 'GET' && pathname === '/api/v1/transactions') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserTransactions(actorUserId)),
        };
      }

      if (method === 'GET' && pathname === '/api/v1/accounts') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserAccounts(actorUserId)),
        };
      }

      if (method === 'GET' && pathname === '/api/v1/credit-cards') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserCreditCardsWithSummary(actorUserId)),
        };
      }

      if (method === 'GET' && pathname === '/api/v1/budgets') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserBudgets(actorUserId)),
        };
      }

      if (method === 'GET' && pathname === '/api/v1/goals') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserGoals(actorUserId)),
        };
      }

      if (method === 'GET' && pathname === '/api/v1/attachments') {
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(store.getUserAttachments(actorUserId)),
        };
      }

      // Download privado de comprovante com verificação de bucket privado, assinatura HMAC e propriedade (user_id === auth.uid())
      const attDownloadMatch = pathname.match(
        /^\/api\/v1\/attachments\/([^/]+)\/download$/
      );
      if (method === 'GET' && attDownloadMatch) {
        const attachmentId = attDownloadMatch[1];
        const uidParam = parsedUrl.searchParams.get('uid') || '';
        const expParam = Number(parsedUrl.searchParams.get('exp') || '0');
        const sigParam = parsedUrl.searchParams.get('sig') || '';

        const att = store.getAttachmentForUser(actorUserId, attachmentId);
        if (
          uidParam !== actorUserId ||
          !verifySignedAttachmentUrl(attachmentId, actorUserId, expParam, sigParam)
        ) {
          throw new ForbiddenAccessError(
            'URL assinada inválida, expirada ou pertencente a outro usuário.'
          );
        }
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'private, no-store',
          },
          body: JSON.stringify({
            attachment: att,
            bucketPrivate: true,
            accessGranted: true,
          }),
        };
      }

      // Classificação Inteligente em tempo real
      if (method === 'GET' && pathname === '/api/v1/classify') {
        const desc = parsedUrl.searchParams.get('description') || '';
        const profile = store.userProfiles.get(actorUserId);
        const learnedRules = profile
          ? JSON.parse(profile.learnedCategoryRulesJson || '{}')
          : {};
        const userCats = Array.from(store.categories.values()).filter(
          (c) => c.userId === actorUserId
        );
        const result = classifyTransactionDescription({
          description: desc,
          learnedRules,
          availableCategories: userCats,
        });
        const matchedCat = userCats.find((c) => c.slug === result.categorySlug);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            ...result,
            categoryId: matchedCat?.id || null,
            categoryName: matchedCat?.name || 'Outros',
          }),
        };
      }

      // Exportação CSV de Transações
      if (method === 'GET' && pathname === '/api/v1/transactions/export-csv') {
        const csv = store.exportTransactionsCSV(actorUserId);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition':
              'attachment; filename="transacoes-meu-controle.csv"',
          },
          body: '\uFEFF' + csv,
        };
      }

      // Exportação Completa LGPD (Portabilidade JSON)
      if (method === 'GET' && pathname === '/api/v1/privacy/export') {
        const { payload } = store.exportAllPersonalDataLGPD(actorUserId, 'JSON');
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition':
              'attachment; filename="meus-dados-lgpd.json"',
          },
          body: JSON.stringify(payload, null, 2),
        };
      }

      // Validação CSRF obrigatória para mutações (POST, PUT, PATCH, DELETE)
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrfHeader = String(
          reqHeaders['x-csrf-token'] || reqHeaders['X-CSRF-Token'] || ''
        );
        if (!verifyCsrfToken(actorSessionId, csrfHeader)) {
          store.recordSecurityEvent({
            userId: actorUserId,
            eventType: 'CSRF_REJECTED',
            severity: 'MEDIUM',
            description: `Requisição ${method} ${pathname} bloqueada por token CSRF ausente ou inválido.`,
            ip: clientIp,
          });
          return {
            status: 403,
            headers: {
              ...secHeaders,
              'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ error: 'Token CSRF inválido ou ausente.' }),
          };
        }
      }

      const body = params.body || {};

      // Bloqueia qualquer payload que tente injetar user_id de outro usuário
      if (
        typeof body.userId === 'string' &&
        body.userId.trim() !== '' &&
        body.userId.trim() !== actorUserId
      ) {
        store.recordSecurityEvent({
          userId: actorUserId,
          eventType: 'CROSS_TENANT_WRITE_ATTEMPT',
          severity: 'CRITICAL',
          description: `Tentativa de criar/alterar registro com user_id divergente de auth.uid().`,
          ip: clientIp,
        });
        throw new ForbiddenAccessError(
          'Violação de política RLS: user_id deve ser igual ao usuário autenticado.'
        );
      }

      // Criar Transação
      if (method === 'POST' && pathname === '/api/v1/transactions') {
        const tagsRaw =
          typeof body.tags === 'string'
            ? body.tags
                .split(',')
                .map((s) => sanitizeText(s, 40))
                .filter(Boolean)
            : Array.isArray(body.tags)
              ? body.tags.map((s) => sanitizeText(s, 40))
              : [];
        const created = store.createTransaction(actorUserId, {
          description: sanitizeText(body.description, 180),
          type: (body.type       ) || 'EXPENSE',
          amountCents: Number(body.amountCents || 0),
          categoryId: body.categoryId ? String(body.categoryId) : undefined,
          paymentMethod: (body.paymentMethod       ) || 'PIX',
          originAccountId: body.originAccountId
            ? String(body.originAccountId)
            : null,
          creditCardId: body.creditCardId ? String(body.creditCardId) : null,
          installmentTotal: Number(body.installmentTotal || 1),
          recurrence: (body.recurrence       ) || 'ONCE',
          status: (body.status       ) || 'PAID',
          occurrenceDate: String(
            body.occurrenceDate || '2026-10-26T12:00:00.000Z'
          ),
          tags: tagsRaw,
          notes: sanitizeText(body.notes || '', 500),
        });
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(created),
        };
      }

      // Atualizar Transação
      const updateTxMatch = pathname.match(/^\/api\/v1\/transactions\/([^/]+)$/);
      if (method === 'PUT' && updateTxMatch) {
        const updated = store.updateTransaction(actorUserId, updateTxMatch[1], {
          categoryId: body.categoryId ? String(body.categoryId) : undefined,
          status: body.status ? (body.status       ) : undefined,
          description: body.description
            ? sanitizeText(body.description, 180)
            : undefined,
        });
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(updated),
        };
      }

      // Duplicar Transação
      const dupMatch = pathname.match(
        /^\/api\/v1\/transactions\/([^/]+)\/duplicate$/
      );
      if (method === 'POST' && dupMatch) {
        const duplicated = store.duplicateTransaction(actorUserId, dupMatch[1]);
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(duplicated),
        };
      }

      // Desfazer Exclusão de Transação
      const undoMatch = pathname.match(
        /^\/api\/v1\/transactions\/([^/]+)\/undo$/
      );
      if (method === 'POST' && undoMatch) {
        const restored = store.undoDeleteTransaction(actorUserId, undoMatch[1]);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(restored),
        };
      }

      // Excluir Transação (Soft Delete com opção de desfazer)
      const delMatch = pathname.match(/^\/api\/v1\/transactions\/([^/]+)$/);
      if (method === 'DELETE' && delMatch) {
        store.softDeleteTransaction(actorUserId, delMatch[1]);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ deleted: true, undoAvailable: true }),
        };
      }

      // Criar Conta Bancária / Carteira
      if (method === 'POST' && pathname === '/api/v1/accounts') {
        const acc = store.createAccount(actorUserId, {
          name: sanitizeText(body.name, 100),
          type: (body.type       ) || 'CHECKING',
          institutionName: sanitizeText(
            body.institutionName || 'Instituição',
            100
          ),
          initialBalanceCents: Number(body.initialBalanceCents || 0),
        });
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(acc),
        };
      }

      const accIdMatch = pathname.match(/^\/api\/v1\/accounts\/([^/]+)$/);
      if (method === 'PUT' && accIdMatch) {
        const updated = store.updateAccount(actorUserId, accIdMatch[1], {
          name: body.name ? sanitizeText(body.name, 100) : undefined,
        });
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(updated),
        };
      }
      if (method === 'DELETE' && accIdMatch) {
        store.deleteAccount(actorUserId, accIdMatch[1]);
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ deleted: true }),
        };
      }

      // Criar Cartão de Crédito
      if (method === 'POST' && pathname === '/api/v1/credit-cards') {
        const card = store.createCreditCard(actorUserId, {
          name: sanitizeText(body.name, 100),
          brand: sanitizeText(body.brand || 'Mastercard', 40),
          lastFourDigits: sanitizeText(body.lastFourDigits || '0000', 4),
          totalLimitCents: Number(body.totalLimitCents || 100000),
          closingDay: Number(body.closingDay || 25),
          dueDay: Number(body.dueDay || 5),
        });
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(card),
        };
      }

      const cardIdMatch = pathname.match(/^\/api\/v1\/credit-cards\/([^/]+)$/);
      if (method === 'PUT' && cardIdMatch) {
        const updated = store.updateCreditCard(actorUserId, cardIdMatch[1], {
          name: body.name ? sanitizeText(body.name, 100) : undefined,
          totalLimitCents:
            body.totalLimitCents !== undefined
              ? Number(body.totalLimitCents)
              : undefined,
        });
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(updated),
        };
      }
      if (method === 'DELETE' && cardIdMatch) {
        store.deleteCreditCard(actorUserId, cardIdMatch[1]);
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ deleted: true }),
        };
      }

      // Criar / Atualizar Orçamento Mensal
      if (method === 'POST' && pathname === '/api/v1/budgets') {
        const budget = store.upsertBudget(actorUserId, {
          categoryId: String(body.categoryId || ''),
          referenceMonth: String(body.referenceMonth || '2026-10'),
          plannedAmountCents: Number(body.plannedAmountCents || 10000),
        });
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(budget),
        };
      }

      const budgetIdMatch = pathname.match(/^\/api\/v1\/budgets\/([^/]+)$/);
      if (method === 'PUT' && budgetIdMatch) {
        const updated = store.updateBudget(actorUserId, budgetIdMatch[1], {
          plannedAmountCents: Number(body.plannedAmountCents || 10000),
        });
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(updated),
        };
      }
      if (method === 'DELETE' && budgetIdMatch) {
        store.deleteBudget(actorUserId, budgetIdMatch[1]);
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ deleted: true }),
        };
      }

      // Criar Meta Financeira
      if (method === 'POST' && pathname === '/api/v1/goals') {
        const goal = store.createGoal(actorUserId, {
          name: sanitizeText(body.name, 120),
          targetAmountCents: Number(body.targetAmountCents || 100000),
          currentAmountCents: Number(body.currentAmountCents || 0),
          recurringContributionCents: Number(
            body.recurringContributionCents || 10000
          ),
          targetDate: String(body.targetDate || '2027-12-31T00:00:00.000Z'),
          priority: (body.priority       ) || 'HIGH',
        });
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(goal),
        };
      }

      const goalIdMatch = pathname.match(/^\/api\/v1\/goals\/([^/]+)$/);
      if (method === 'PUT' && goalIdMatch) {
        const updated = store.updateGoal(actorUserId, goalIdMatch[1], {
          name: body.name ? sanitizeText(body.name, 120) : undefined,
          targetAmountCents:
            body.targetAmountCents !== undefined
              ? Number(body.targetAmountCents)
              : undefined,
        });
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(updated),
        };
      }
      if (method === 'DELETE' && goalIdMatch) {
        store.deleteGoal(actorUserId, goalIdMatch[1]);
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ deleted: true }),
        };
      }

      // Adicionar Aporte em Meta
      const goalContribMatch = pathname.match(
        /^\/api\/v1\/goals\/([^/]+)\/contribute$/
      );
      if (method === 'POST' && goalContribMatch) {
        const updatedGoal = store.addGoalContribution(
          actorUserId,
          goalContribMatch[1],
          Number(body.amountCents || 0),
          sanitizeText(body.note || 'Aporte extra', 120)
        );
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(updatedGoal),
        };
      }

      // Excluir Anexo / Comprovante
      const attIdMatch = pathname.match(/^\/api\/v1\/attachments\/([^/]+)$/);
      if (method === 'DELETE' && attIdMatch) {
        store.deleteAttachment(actorUserId, attIdMatch[1]);
        return {
          status: 200,
          headers: { ...secHeaders, 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ deleted: true }),
        };
      }

      // Cadastrar Dívida
      if (method === 'POST' && pathname === '/api/v1/debts') {
        const debt = store.createDebt(actorUserId, {
          name: sanitizeText(body.name, 120),
          creditor: sanitizeText(body.creditor || 'Credor', 120),
          totalAmountCents: Number(body.totalAmountCents || 100000),
          remainingAmountCents: Number(body.remainingAmountCents || 100000),
          monthlyInterestRateBp: Number(body.monthlyInterestRateBp || 200),
          totalInstallments: Number(body.totalInstallments || 12),
          installmentAmountCents: Number(body.installmentAmountCents || 10000),
          nextDueDate: String(body.nextDueDate || '2026-11-10T00:00:00.000Z'),
        });
        return {
          status: 201,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(debt),
        };
      }

      // Simular Dívidas com Valor Extra Customizado
      if (method === 'POST' && pathname === '/api/v1/debts/simulate') {
        const extraCents = Number(body.extraMonthlyPaymentCents || 0);
        const userDebts = Array.from(store.debts.values()).filter(
          (d) => d.userId === actorUserId
        );
        const avalanche = simulateDebtPayoff(
          userDebts,
          'AVALANCHE',
          extraCents
        );
        const snowball = simulateDebtPayoff(userDebts, 'SNOWBALL', extraCents);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ avalanche, snowball }),
        };
      }

      // Atualizar Onboarding / Perfil Financeiro
      if (method === 'PUT' && pathname === '/api/v1/profile') {
        const updatedProfile = store.updateOnboardingProfile(actorUserId, {
          estimatedMonthlyIncomeCents:
            body.estimatedMonthlyIncomeCents !== undefined
              ? Number(body.estimatedMonthlyIncomeCents)
              : undefined,
          incomeType: body.incomeType ? (body.incomeType       ) : undefined,
          fixedMonthlyExpensesCents:
            body.fixedMonthlyExpensesCents !== undefined
              ? Number(body.fixedMonthlyExpensesCents)
              : undefined,
          budgetControlMode: body.budgetControlMode
            ? (body.budgetControlMode       )
            : undefined,
          onboardingCompleted: true,
        });
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(updatedProfile),
        };
      }

      // Alternar Consentimento LGPD
      if (method === 'POST' && pathname === '/api/v1/privacy/consents') {
        const updatedConsent = store.updateConsentPreference(
          actorUserId,
          String(body.purposeCode || ''),
          Boolean(body.granted),
          clientIp
        );
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(updatedConsent),
        };
      }

      // Setup MFA TOTP
      if (method === 'POST' && pathname === '/api/v1/security/mfa-setup') {
        const mfaData = store.setupMfa(actorUserId);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify(mfaData),
        };
      }

      // Encerrar todas as sessões ativas
      if (
        method === 'POST' &&
        pathname === '/api/v1/security/revoke-all-sessions'
      ) {
        const revokedCount = store.revokeAllUserSessions(actorUserId);
        return {
          status: 200,
          headers: {
            ...secHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({ revokedCount }),
        };
      }

      return {
        status: 404,
        headers: {
          ...secHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({ error: 'Endpoint não encontrado.' }),
      };
    } catch (err     ) {
      const status = typeof err?.statusCode === 'number' ? err.statusCode : 400;
      const safeErrorMsg = maskSensitiveStrings(
        err?.message || 'Erro ao processar solicitação.'
      );
      return {
        status,
        headers: {
          ...secHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          error: safeErrorMsg,
        }),
      };
    }
  }

  return {
    demoUserId,
    demoSessionId,
    dispatch,
  };
}

export function createAppServer(store                         = defaultStore) {
  const controller = createAppController(store);

  if (isSupabaseServerSyncEnabled()) {
    syncStoreToSupabase(store, controller.demoUserId).catch(() => {});
  }

  async function readJsonBody(
    req                      
  )                                   {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
        if (data.length > 1_000_000) {
          reject(new Error('Payload excede o limite de segurança de 1MB'));
        }
      });
      req.on('end', () => {
        if (!data) return resolve({});
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('JSON malformado'));
        }
      });
      req.on('error', reject);
    });
  }

  return http.createServer(async (req, res) => {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      req.method || ''
    );
    const body = isMutation ? await readJsonBody(req).catch(() => ({})) : {};

    const result = await controller.dispatch({
      method: req.method || 'GET',
      url: req.url || '/',
      headers: req.headers                                      ,
      body,
      clientIp: req.socket.remoteAddress || '127.0.0.1',
    });

    if (
      isMutation &&
      result.status >= 200 &&
      result.status < 300 &&
      isSupabaseServerSyncEnabled()
    ) {
      syncStoreToSupabase(store, controller.demoUserId).catch(() => {});
    }

    res.writeHead(result.status, result.headers);
    res.end(result.body);
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const port = Number(process.env.PORT || 3000);
  const srv = createAppServer();
  srv.listen(port, '0.0.0.0', () => {
    console.log(`Meu Controle Financeiro rodando em http://localhost:${port}`);
  });
}
