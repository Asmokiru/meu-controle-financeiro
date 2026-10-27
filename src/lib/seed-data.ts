import { FinancialPlatformStore, defaultStore } from './store/database.ts';

export const DEMO_USER_CREDENTIALS = {
  name: 'Mariana Costa',
  email: 'demo@exemplo.ficticio.local',
  password: 'Demo@Segura2026!Ficticia',
};

/**
 * Popula a instância do banco com dados fictícios da Conta Demonstração (Mariana Costa),
 * mantendo os nomes dos registros limpos (sem sufixos ou prefixos [DEMO]/[EXEMPLO] nos títulos),
 * garantindo que todos os módulos, gráficos, alertas e insights funcionem na demonstração.
 */
export function seedDemoData(store: FinancialPlatformStore = defaultStore): {
  demoUserId: string;
} {
  const existing = Array.from(store.users.values()).find(
    (u) => u.email === DEMO_USER_CREDENTIALS.email
  );
  if (existing) {
    return { demoUserId: existing.id };
  }

  const { user } = store.registerUser({
    name: DEMO_USER_CREDENTIALS.name,
    email: DEMO_USER_CREDENTIALS.email,
    password: DEMO_USER_CREDENTIALS.password,
    acceptedTermsAndPrivacy: true,
    ip: '127.0.0.1',
    isDemoAccount: true,
  });

  const userId = user.id;

  // 1. Atualiza Onboarding Financeiro da Conta Demonstração
  store.updateOnboardingProfile(userId, {
    estimatedMonthlyIncomeCents: 850000, // R$ 8.500,00
    incomeType: 'MIXED',
    mainGoals: [
      'Reserva de Emergência',
      'Quitar Dívidas',
      'Viagem em Família',
    ],
    fixedMonthlyExpensesCents: 320000, // R$ 3.200,00
    hasExistingDebts: true,
    budgetControlMode: 'FAMILY',
    relevantCategories: [
      'Moradia',
      'Alimentação',
      'Transporte',
      'Saúde',
      'Assinaturas',
      'Lazer',
    ],
    onboardingCompleted: true,
    themePreference: 'system',
  });

  // 2. Cria Contas e Carteiras com nomes limpos
  const checkingAcc = store.createAccount(userId, {
    name: 'Banco Horizonte - Conta Principal',
    type: 'CHECKING',
    institutionName: 'Banco Horizonte S.A.',
    initialBalanceCents: 345000,
    color: '#0F766E',
    icon: 'landmark',
  });

  const digitalAcc = store.createAccount(userId, {
    name: 'Conta Digital Reserva',
    type: 'DIGITAL_ACCOUNT',
    institutionName: 'Horizonte Pagamentos Digitais',
    initialBalanceCents: 958000,
    color: '#0284C7',
    icon: 'smartphone',
  });

  const cashWallet = store.createAccount(userId, {
    name: 'Carteira em Dinheiro',
    type: 'CASH_WALLET',
    institutionName: 'Espécie',
    initialBalanceCents: 22000,
    color: '#D97706',
    icon: 'wallet',
  });

  const investAcc = store.createAccount(userId, {
    name: 'Tesouro Direto & CDB',
    type: 'INVESTMENT',
    institutionName: 'Corretora Horizonte Invest',
    initialBalanceCents: 1450000,
    color: '#059669',
    icon: 'trending-up',
  });

  // 3. Cria Cartões de Crédito com nomes limpos
  const cardMain = store.createCreditCard(userId, {
    name: 'Cartão Horizonte Platinum',
    brand: 'Mastercard',
    lastFourDigits: '0000',
    totalLimitCents: 600000, // R$ 6.000,00
    closingDay: 28,
    dueDay: 5,
    alertThresholdPct: 80,
    color: '#1E293B',
  });

  const cardMarket = store.createCreditCard(userId, {
    name: 'Cartão Compras & Casa',
    brand: 'Visa',
    lastFourDigits: '1111',
    totalLimitCents: 250000, // R$ 2.500,00
    closingDay: 15,
    dueDay: 22,
    alertThresholdPct: 80,
    color: '#7C3AED',
  });

  // Helper para buscar categoria pelo slug
  const getCatId = (slug: string) => {
    const found = Array.from(store.categories.values()).find(
      (c) => c.userId === userId && c.slug === slug
    );
    return found ? found.id : '';
  };

  // 4. Transações do mês anterior (Setembro/2026) para comparação histórica
  store.createTransaction(userId, {
    type: 'INCOME',
    amountCents: 650000,
    occurrenceDate: '2026-09-05T10:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('salario'),
    description: 'Salário Mensal Setembro',
    paymentMethod: 'TRANSFER',
    status: 'PAID',
  });

  // Alimentação em Setembro: R$ 650,00 -> em Outubro será R$ 767,00 (+18% exatos!)
  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 65000,
    occurrenceDate: '2026-09-12T14:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('alimentacao'),
    description: 'Supermercado Mensal Setembro',
    paymentMethod: 'DEBIT',
    status: 'PAID',
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 220000,
    occurrenceDate: '2026-09-10T09:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('moradia'),
    description: 'Aluguel e Condomínio Setembro',
    paymentMethod: 'BOLETO',
    status: 'PAID',
  });

  // 5. Transações do mês atual (Outubro/2026)
  store.createTransaction(userId, {
    type: 'INCOME',
    amountCents: 650000,
    occurrenceDate: '2026-10-05T09:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('salario'),
    description: 'Salário Líquido Outubro',
    paymentMethod: 'TRANSFER',
    status: 'PAID',
    recurrence: 'MONTHLY',
    tags: ['renda-fixa', 'trabalho'],
  });

  store.createTransaction(userId, {
    type: 'INCOME',
    amountCents: 210000,
    occurrenceDate: '2026-10-14T16:30:00.000Z',
    originAccountId: digitalAcc.id,
    categoryId: getCatId('freelance'),
    description: 'Projeto UX Design Freelance',
    paymentMethod: 'PIX',
    status: 'PAID',
    tags: ['renda-extra', 'freela'],
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 225000,
    occurrenceDate: '2026-10-10T10:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('moradia'),
    description: 'Aluguel e Condomínio Residencial',
    paymentMethod: 'BOLETO',
    status: 'PAID',
    recurrence: 'MONTHLY',
    tags: ['essencial', 'casa'],
  });

  // Alimentação em Outubro = R$ 767,00 (aumento de 18% sobre R$ 650,00 de Setembro)
  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 54700,
    occurrenceDate: '2026-10-11T11:20:00.000Z',
    creditCardId: cardMarket.id,
    categoryId: getCatId('alimentacao'),
    description: 'Supermercado Família (Compra do Mês)',
    paymentMethod: 'CREDIT',
    status: 'PAID',
    tags: ['mercado', 'familia'],
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 22000,
    occurrenceDate: '2026-10-18T19:45:00.000Z',
    creditCardId: cardMain.id,
    categoryId: getCatId('alimentacao'),
    description: 'Hortifruti & Padaria Semanal',
    paymentMethod: 'CREDIT',
    status: 'PAID',
    tags: ['feira'],
  });

  // Transporte em Outubro = R$ 255,00 (exatamente 85% do orçamento de R$ 300,00!)
  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 25500,
    occurrenceDate: '2026-10-19T08:15:00.000Z',
    creditCardId: cardMain.id,
    categoryId: getCatId('transporte'),
    description: 'Combustível e Mobilidade Urbana',
    paymentMethod: 'CREDIT',
    status: 'PAID',
    tags: ['mobilidade'],
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 8990,
    occurrenceDate: '2026-10-15T08:00:00.000Z',
    creditCardId: cardMain.id,
    categoryId: getCatId('assinaturas'),
    description: 'Streaming Vídeo + Música Familiar',
    paymentMethod: 'CREDIT',
    status: 'PAID',
    recurrence: 'MONTHLY',
    tags: ['recorrente', 'streaming'],
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 42000,
    occurrenceDate: '2026-10-16T15:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('saude'),
    description: 'Plano de Saúde + Farmácia',
    paymentMethod: 'DEBIT',
    status: 'PAID',
    tags: ['saude'],
  });

  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 18500,
    occurrenceDate: '2026-10-20T17:00:00.000Z',
    originAccountId: cashWallet.id,
    categoryId: getCatId('lazer'),
    description: 'Passeio Cultural e Cinema em Família',
    paymentMethod: 'CASH',
    status: 'PAID',
    tags: ['lazer'],
  });

  // Compra parcelada em 3x no cartão
  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 90000,
    occurrenceDate: '2026-10-08T14:00:00.000Z',
    creditCardId: cardMain.id,
    categoryId: getCatId('educacao'),
    description: 'Curso de Especialização Online (3x)',
    paymentMethod: 'CREDIT',
    status: 'PAID',
    installmentTotal: 3,
    tags: ['estudos', 'parcelado'],
  });

  // Próximo vencimento agendado
  store.createTransaction(userId, {
    type: 'EXPENSE',
    amountCents: 16500,
    occurrenceDate: '2026-10-28T10:00:00.000Z',
    dueDate: '2026-10-28T10:00:00.000Z',
    originAccountId: checkingAcc.id,
    categoryId: getCatId('moradia'),
    description: 'Conta de Energia Elétrica',
    paymentMethod: 'BOLETO',
    status: 'PENDING',
    recurrence: 'MONTHLY',
    tags: ['conta-fixa'],
  });

  // Aporte em Investimentos
  store.createTransaction(userId, {
    type: 'INVESTMENT',
    amountCents: 80000,
    occurrenceDate: '2026-10-06T11:00:00.000Z',
    originAccountId: checkingAcc.id,
    destinationAccountId: investAcc.id,
    categoryId: getCatId('investimentos'),
    description: 'Aporte Mensal Tesouro Selic',
    paymentMethod: 'PIX',
    status: 'PAID',
    tags: ['reserva', 'futuro'],
  });

  // 6. Orçamentos Mensais
  store.upsertBudget(userId, {
    categoryId: getCatId('alimentacao'),
    referenceMonth: '2026-10',
    plannedAmountCents: 80000, // R$ 800,00
  });
  store.upsertBudget(userId, {
    categoryId: getCatId('transporte'),
    referenceMonth: '2026-10',
    plannedAmountCents: 30000, // R$ 300,00 (Gasto R$ 255 = 85%!)
  });
  store.upsertBudget(userId, {
    categoryId: getCatId('lazer'),
    referenceMonth: '2026-10',
    plannedAmountCents: 25000, // R$ 250,00
  });
  store.upsertBudget(userId, {
    categoryId: getCatId('assinaturas'),
    referenceMonth: '2026-10',
    plannedAmountCents: 10000, // R$ 100,00
  });

  // 7. Metas Financeiras (Incluindo Reserva de Emergência a R$ 420 da conclusão!)
  store.createGoal(userId, {
    name: 'Reserva de Emergência',
    targetAmountCents: 1000000, // R$ 10.000,00
    currentAmountCents: 958000, // R$ 9.580,00 -> Faltam exatamente R$ 420,00!
    targetDate: '2026-12-31T00:00:00.000Z',
    recurringContributionCents: 50000,
    priority: 'CRITICAL',
    accountId: digitalAcc.id,
    icon: 'shield-check',
    color: '#059669',
  });

  store.createGoal(userId, {
    name: 'Viagem em Família - Nordeste',
    targetAmountCents: 600000, // R$ 6.000,00
    currentAmountCents: 240000, // R$ 2.400,00
    targetDate: '2027-07-01T00:00:00.000Z',
    recurringContributionCents: 30000,
    priority: 'MEDIUM',
    accountId: digitalAcc.id,
    icon: 'plane',
    color: '#0284C7',
  });

  store.createGoal(userId, {
    name: 'Quitação Antecipada de Dívidas',
    targetAmountCents: 450000,
    currentAmountCents: 180000,
    targetDate: '2027-04-01T00:00:00.000Z',
    recurringContributionCents: 45000,
    priority: 'HIGH',
    accountId: checkingAcc.id,
    icon: 'check-circle',
    color: '#7C3AED',
  });

  // 8. Dívidas para Simulação Avalanche vs. Bola de Neve
  store.createDebt(userId, {
    name: 'Crédito Pessoal Renegociado',
    creditor: 'Financeira Horizonte S.A.',
    totalAmountCents: 480000,
    remainingAmountCents: 310000,
    monthlyInterestRateBp: 289, // 2,89% a.m.
    totalInstallments: 24,
    paidInstallments: 9,
    installmentAmountCents: 26500,
    nextDueDate: '2026-11-05T00:00:00.000Z',
    status: 'ACTIVE',
    preferredStrategy: 'AVALANCHE',
  });

  store.createDebt(userId, {
    name: 'Parcelamento Equipamento de Trabalho',
    creditor: 'Loja Tech Brasil',
    totalAmountCents: 240000,
    remainingAmountCents: 115000,
    monthlyInterestRateBp: 149, // 1,49% a.m.
    totalInstallments: 12,
    paidInstallments: 6,
    installmentAmountCents: 21800,
    nextDueDate: '2026-11-10T00:00:00.000Z',
    status: 'ACTIVE',
    preferredStrategy: 'SNOWBALL',
  });

  // 9. Notificações Iniciais
  store.createNotification({
    userId,
    type: 'BUDGET_THRESHOLD',
    title: 'Alerta de Orçamento: Transporte em 85%',
    message:
      'Você já utilizou R$ 255,00 (85%) do orçamento mensal planejado de R$ 300,00 para Transporte.',
  });

  store.createNotification({
    userId,
    type: 'UPCOMING_DUE',
    title: 'Vencimento próximo em 2 dias',
    message:
      'A conta "Conta de Energia Elétrica" (R$ 165,00) vence em 28/10/2026.',
  });

  return { demoUserId: userId };
}
