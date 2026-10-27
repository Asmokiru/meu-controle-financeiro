import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
                                                            
import { maskSensitiveStrings } from '../security/crypto.mjs';

if (typeof window !== 'undefined') {
  throw new Error(
    'VIOLAÇÃO DE SEGURANÇA: supabase-sync.ts é um módulo estritamente server-side.'
  );
}

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

/**
 * Carrega variáveis do arquivo .env local apenas no servidor, sem sobrescrever variáveis já definidas.
 */
export function loadLocalEnvFile()       {
  try {
    const candidates = [
      path.resolve(PROJECT_ROOT, '.env'),
      path.resolve(process.cwd(), '.env'),
    ];
    const envPath = candidates.find((p) => fs.existsSync(p));
    if (!envPath) return;
    const content = fs.readFileSync(envPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignora caso não exista .env
  }
}

/**
 * Obtém configuração administrativa do Supabase exclusivamente no backend.
 * NUNCA retorna a chave ou URL para o frontend ou respostas de API.
 */
function getServerSupabaseCredentials()   
              
                    
                   
  {
  loadLocalEnvFile();
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();

  const enabled = Boolean(
    url &&
      secretKey &&
      url.startsWith('https://') &&
      !url.includes('SEU_PROJETO') &&
      !url.includes('[SEU-PROJECT-REF]') &&
      !secretKey.includes('placeholder') &&
      !secretKey.includes('substitua')
  );

  return { url, secretKey, enabled };
}

export function isSupabaseServerSyncEnabled()          {
  return getServerSupabaseCredentials().enabled;
}

/**
 * Faz upsert (inserção ou atualização) de registros em uma tabela do Supabase via PostgREST
 * exclusivamente a partir de rotinas internas autorizadas no servidor.
 */
export async function upsertToSupabaseTable(
  table        ,
  rows                           ,
  onConflictColumn         
)                                                           {
  const { url, secretKey, enabled } = getServerSupabaseCredentials();
  if (!enabled || rows.length === 0) {
    return {
      ok: false,
      status: 0,
      error: 'Sincronização em nuvem desativada neste ambiente.',
    };
  }

  const query = onConflictColumn
    ? `?on_conflict=${encodeURIComponent(onConflictColumn)}`
    : '';

  try {
    const res = await fetch(`${url}/rest/v1/${table}${query}`, {
      method: 'POST',
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(rows),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        status: res.status,
        error: maskSensitiveStrings(errText),
      };
    }
    return { ok: true, status: res.status };
  } catch (err     ) {
    return {
      ok: false,
      status: 500,
      error: maskSensitiveStrings(err?.message || 'Erro de comunicação'),
    };
  }
}

async function fetchRemoteRows(
  table        ,
  filterQuery        
)                 {
  const { url, secretKey, enabled } = getServerSupabaseCredentials();
  if (!enabled) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${table}?${filterQuery}`, {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Rotina administrativa interna de sincronização (server-only).
 * Valida que o userId existe antes de sincronizar e jamais expõe chaves ou variáveis de ambiente.
 */
export async function syncStoreToSupabase(
  store                        ,
  userId        
)           
                  
                         
                 
   {
  if (!isSupabaseServerSyncEnabled()) {
    return {
      synced: false,
      tablesSynced: [],
      error: 'Sincronização em nuvem não habilitada no servidor.',
    };
  }

  const tablesSynced           = [];
  const user = store.users.get(userId);
  if (!user) {
    return { synced: false, tablesSynced: [], error: 'Usuário não encontrado.' };
  }

  const existingUsers = await fetchRemoteRows(
    'users',
    `email=eq.${encodeURIComponent(user.email)}&select=id`
  );
  const remoteUserId         =
    existingUsers.length > 0 && existingUsers[0].id
      ? existingUsers[0].id
      : user.id;

  // 1. users
  {
    const r = await upsertToSupabaseTable(
      'users',
      [
        {
          id: remoteUserId,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          emailVerified: user.emailVerified,
          isDemoAccount: user.isDemoAccount,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      ],
      'email'
    );
    if (!r.ok) {
      return {
        synced: false,
        tablesSynced,
        error: maskSensitiveStrings(`Falha ao sincronizar tabela users.`),
      };
    }
    tablesSynced.push('users');
  }

  // 2. user_profiles
  const profile = store.userProfiles.get(userId);
  if (profile) {
    const r = await upsertToSupabaseTable(
      'user_profiles',
      [
        {
          id: profile.id,
          userId: remoteUserId,
          estimatedMonthlyIncomeCents: profile.estimatedMonthlyIncomeCents,
          encryptedIncomeData: profile.encryptedIncomeData,
          incomeType: profile.incomeType,
          mainGoals: profile.mainGoals,
          fixedMonthlyExpensesCents: profile.fixedMonthlyExpensesCents,
          hasExistingDebts: profile.hasExistingDebts,
          budgetControlMode: profile.budgetControlMode,
          relevantCategories: profile.relevantCategories,
          onboardingCompleted: profile.onboardingCompleted,
          themePreference: profile.themePreference,
          learnedCategoryRulesJson: profile.learnedCategoryRulesJson,
        },
      ],
      'userId'
    );
    if (r.ok) tablesSynced.push('user_profiles');
  }

  // 3. categories
  const existingRemoteCats = await fetchRemoteRows(
    'categories',
    `userId=eq.${encodeURIComponent(remoteUserId)}&select=id,slug`
  );
  const slugToRemoteCatId = new Map                ();
  for (const rc of existingRemoteCats) {
    slugToRemoteCatId.set(rc.slug, rc.id);
  }

  const localCats = Array.from(store.categories.values()).filter(
    (c) => c.userId === userId
  );
  if (localCats.length > 0) {
    const catRows = localCats.map((c) => ({
      id: slugToRemoteCatId.get(c.slug) || c.id,
      userId: remoteUserId,
      name: c.name,
      slug: c.slug,
      type: c.type,
      icon: c.icon,
      color: c.color,
      isSystem: c.isSystem,
      isFixedCost: c.isFixedCost,
      keywords: c.keywords,
    }));
    const r = await upsertToSupabaseTable('categories', catRows, 'id');
    if (r.ok) tablesSynced.push('categories');
  }

  const remoteCats = await fetchRemoteRows(
    'categories',
    `userId=eq.${encodeURIComponent(remoteUserId)}&select=id,slug`
  );
  for (const rc of remoteCats) {
    slugToRemoteCatId.set(rc.slug, rc.id);
  }
  const localCatIdToRemoteCatId = (localCatId        )         => {
    const lc = store.categories.get(localCatId);
    if (lc && slugToRemoteCatId.has(lc.slug)) {
      return slugToRemoteCatId.get(lc.slug) ;
    }
    return localCatId;
  };

  // 4. accounts
  const accs = store.getUserAccounts(userId).map((a) => ({
    id: a.id,
    userId: remoteUserId,
    name: a.name,
    type: a.type,
    institutionName: a.institutionName,
    initialBalanceCents: a.initialBalanceCents,
    currentBalanceCents: a.currentBalanceCents,
    color: a.color,
    icon: a.icon,
    isArchived: a.isArchived,
  }));
  if (accs.length > 0) {
    const r = await upsertToSupabaseTable('accounts', accs, 'id');
    if (r.ok) tablesSynced.push('accounts');
  }

  // 5. credit_cards
  const cards = Array.from(store.creditCards.values())
    .filter((c) => c.userId === userId)
    .map((c) => ({
      id: c.id,
      userId: remoteUserId,
      name: c.name,
      brand: c.brand,
      lastFourDigits: c.lastFourDigits,
      totalLimitCents: c.totalLimitCents,
      closingDay: c.closingDay,
      dueDay: c.dueDay,
      alertThresholdPct: c.alertThresholdPct,
      color: c.color,
      isArchived: c.isArchived,
    }));
  if (cards.length > 0) {
    const r = await upsertToSupabaseTable('credit_cards', cards, 'id');
    if (r.ok) tablesSynced.push('credit_cards');
  }

  // 6. transactions
  const txs = Array.from(store.transactions.values())
    .filter((t) => t.userId === userId)
    .map((t) => ({
      id: t.id,
      userId: remoteUserId,
      type: t.type,
      amountCents: t.amountCents,
      occurrenceDate: t.occurrenceDate,
      dueDate: t.dueDate,
      originAccountId: t.originAccountId,
      destinationAccountId: t.destinationAccountId,
      creditCardId: t.creditCardId,
      categoryId: localCatIdToRemoteCatId(t.categoryId),
      description: t.description,
      paymentMethod: t.paymentMethod,
      status: t.status,
      recurrence: t.recurrence,
      installmentTotal: t.installmentTotal,
      tags: t.tags,
      notes: t.notes,
      autoClassified: t.autoClassified,
      userCorrectedCat: t.userCorrectedCat,
      deletedAt: t.deletedAt,
    }));
  if (txs.length > 0) {
    const r = await upsertToSupabaseTable('transactions', txs, 'id');
    if (r.ok) tablesSynced.push('transactions');
  }

  // 7. budgets
  const buds = Array.from(store.budgets.values())
    .filter((b) => b.userId === userId)
    .map((b) => ({
      id: b.id,
      userId: remoteUserId,
      categoryId: localCatIdToRemoteCatId(b.categoryId),
      referenceMonth: b.referenceMonth,
      plannedAmountCents: b.plannedAmountCents,
    }));
  if (buds.length > 0) {
    const r = await upsertToSupabaseTable('budgets', buds, 'id');
    if (r.ok) tablesSynced.push('budgets');
  }

  // 8. goals
  const goals = Array.from(store.goals.values())
    .filter((g) => g.userId === userId)
    .map((g) => ({
      id: g.id,
      userId: remoteUserId,
      accountId: g.accountId,
      name: g.name,
      targetAmountCents: g.targetAmountCents,
      currentAmountCents: g.currentAmountCents,
      targetDate: g.targetDate,
      recurringContributionCents: g.recurringContributionCents,
      priority: g.priority,
    }));
  if (goals.length > 0) {
    const r = await upsertToSupabaseTable('goals', goals, 'id');
    if (r.ok) tablesSynced.push('goals');
  }

  // 9. debts
  const debts = Array.from(store.debts.values())
    .filter((d) => d.userId === userId)
    .map((d) => ({
      id: d.id,
      userId: remoteUserId,
      name: d.name,
      creditor: d.creditor,
      totalAmountCents: d.totalAmountCents,
      remainingAmountCents: d.remainingAmountCents,
      monthlyInterestRateBp: d.monthlyInterestRateBp,
      totalInstallments: d.totalInstallments,
      paidInstallments: d.paidInstallments,
      installmentAmountCents: d.installmentAmountCents,
      nextDueDate: d.nextDueDate,
      status: d.status,
      preferredStrategy: d.preferredStrategy,
    }));
  if (debts.length > 0) {
    const r = await upsertToSupabaseTable('debts', debts, 'id');
    if (r.ok) tablesSynced.push('debts');
  }

  return { synced: true, tablesSynced };
}
