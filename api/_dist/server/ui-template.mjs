import { formatBRLFromCents, formatDateBR } from '../lib/finance/formatters.mjs';

// Biblioteca de ícones Lucide SVG consistentes (stroke-width 1.8, aria-hidden="true")
export const LUCIDE_ICONS                         = {
  layoutDashboard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  arrowLeftRight:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>',
  creditCard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
  pieChart:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>',
  target:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  trendingDown:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
  trendingUp:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  barChart3:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  settings:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  wallet:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>',
  shieldCheck:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  sparkles:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  plus:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  calendar:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
  checkCircle:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  alertTriangle:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  alertCircle:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
  clock:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  minusCircle:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
  moon:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  arrowUpRight:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
  arrowDownRight:
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 7 10 10"/><path d="M17 7v10H7"/></svg>',
  download:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  lock:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  user:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  maximize2:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
  minimize2:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/></svg>',
  xClose:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
};

// Padronização estrita de Chips/Pílulas para os 5 estados semânticos (sempre com ícone + texto)
export function renderStateChip(
  stateType                                                             ,
  customLabel         
)         {
  const map = {
    positivo: {
      cls: 'chip-positivo',
      icon: LUCIDE_ICONS.checkCircle,
      defaultText: 'Positivo',
    },
    atencao: {
      cls: 'chip-atencao',
      icon: LUCIDE_ICONS.alertTriangle,
      defaultText: 'Atenção',
    },
    critico: {
      cls: 'chip-critico',
      icon: LUCIDE_ICONS.alertCircle,
      defaultText: 'Crítico',
    },
    estavel: {
      cls: 'chip-estavel',
      icon: LUCIDE_ICONS.minusCircle,
      defaultText: 'Estável',
    },
    pendente: {
      cls: 'chip-pendente',
      icon: LUCIDE_ICONS.clock,
      defaultText: 'Pendente',
    },
  };
  const cfg = map[stateType];
  return `<span class="chip ${cfg.cls}">${cfg.icon}<span>${customLabel || cfg.defaultText}</span></span>`;
}

export function renderDashboardServerSide(state     )         {
  const d = state.dashboard;

  const isPositiveResult = d.monthlyResultCents >= 0;
  const resultChip = isPositiveResult
    ? renderStateChip('positivo', `Positivo (+${d.savingsRatePercentage}% poupado)`)
    : renderStateChip('critico', 'Resultado negativo');

  const expComp = d.expenseComparisonPrevMonthPct || 0;
  const expTrendChip =
    expComp > 10
      ? renderStateChip('atencao', `+${expComp}% vs set/26`)
      : expComp < 0
        ? renderStateChip('positivo', `${expComp}% vs set/26`)
        : renderStateChip('estavel', 'Estável vs set/26');

  // No máximo 3 alertas prioritários em Insights Financeiros do Dia
  const rawInsights           = (d.dailyInsights || []).slice(0, 3);
  const structuredInsights = rawInsights.map((text        , idx        ) => {
    if (text.toLowerCase().includes('alimentação')) {
      return {
        chip: renderStateChip('atencao', 'Atenção'),
        title: 'Variação em Alimentação',
        description: text,
        targetTab: 'transactions',
      };
    }
    if (text.toLowerCase().includes('orçamento') || text.toLowerCase().includes('transporte')) {
      return {
        chip: renderStateChip('atencao', 'Atenção'),
        title: 'Limite de orçamento próximo',
        description: text,
        targetTab: 'budgets',
      };
    }
    if (text.toLowerCase().includes('meta') || text.toLowerCase().includes('reserva')) {
      return {
        chip: renderStateChip('positivo', 'Positivo'),
        title: 'Meta quase concluída',
        description: text,
        targetTab: 'goals',
      };
    }
    return {
      chip: renderStateChip(idx === 0 ? 'estavel' : 'positivo'),
      title: 'Resumo de hábito financeiro',
      description: text,
      targetTab: 'reports',
    };
  });

  const insightsCardsHtml = structuredInsights
    .map(
      (item) => `
      <div class="insight-item">
        <div class="insight-item-top">
          <div style="display:flex;align-items:center;gap:8px;">
            ${item.chip}
            <span class="insight-title">${item.title}</span>
          </div>
          <button type="button" class="link-action" data-nav-tab="${item.targetTab}">Ver detalhes →</button>
        </div>
        <p class="insight-desc">${item.description}</p>
      </div>`
    )
    .join('');

  // Barra empilhada limpa + legenda clara para Gastos por Categoria
  const segmentedBarHtml = (d.expensesByCategory || [])
    .map(
      (c     ) =>
        `<div style="width:${Math.max(3, c.sharePct)}%;background:${c.color};height:100%;" title="${c.categoryName}: ${c.sharePct}% (${formatBRLFromCents(c.spentCents)})"></div>`
    )
    .join('');

  const catRows = (d.expensesByCategory || [])
    .map((c     ) => {
      const stateChip =
        c.variationPct > 10
          ? renderStateChip('atencao', `+${c.variationPct}% vs mês ant.`)
          : renderStateChip('estavel', 'Estável');
      return `<div class="category-row">
        <div class="category-row-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="category-dot" style="background:${c.color};"></span>
            <span class="category-name">${c.categoryName}</span>
            <span class="text-aux">${c.sharePct}% do total</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            ${stateChip}
            <span class="money-inline">${formatBRLFromCents(c.spentCents)}</span>
          </div>
        </div>
        <div class="progress-track" role="progressbar" aria-label="Gasto em ${c.categoryName}" aria-valuenow="${c.sharePct}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width:${Math.min(100, c.sharePct)}%;background:${c.color};"></div>
        </div>
      </div>`;
    })
    .join('');

  const goalsHtml = (d.goalProjections || [])
    .map((g     ) => {
      const goalChip =
        g.progressPercentage >= 100
          ? renderStateChip('positivo', 'Positivo')
          : g.onTrack
            ? renderStateChip('estavel', 'Estável')
            : renderStateChip('atencao', 'Atenção');
      return `<div class="goal-item">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <div>
            <div style="font-weight:600;color:var(--text-primary);font-size:0.95rem;">${g.name}</div>
            <div class="text-aux">Prazo: ${g.monthsUntilDeadline} mes(es) • Acumulado: <strong style="color:var(--text-primary);">${formatBRLFromCents(g.currentAmountCents)}</strong> de ${formatBRLFromCents(g.targetAmountCents)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:700;font-size:0.92rem;color:var(--brand-primary);">${g.progressPercentage}%</span>
            ${goalChip}
          </div>
        </div>
        <div class="progress-track" role="progressbar" aria-label="Progresso da meta ${g.name}" aria-valuenow="${g.progressPercentage}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width:${g.progressPercentage}%;background:var(--brand-primary);"></div>
        </div>
        <p class="text-aux" style="margin-top:4px;">${g.recommendationMessage}</p>
      </div>`;
    })
    .join('');

  const cardsHtml = (d.creditCardsSummary || [])
    .map((card     ) => {
      const cardChip = card.highUsageAlert
        ? renderStateChip('critico', `${card.usagePercentage}% utilizado`)
        : renderStateChip('estavel', `${card.usagePercentage}% utilizado`);
      return `<div class="subcard">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">
            <span class="icon-badge">${LUCIDE_ICONS.creditCard}</span>
            <span>${card.name} <span class="text-aux">•••• ${card.lastFourDigits}</span></span>
          </div>
          ${cardChip}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-size:0.86rem;color:var(--text-secondary);">
          <span>Fatura atual: <strong style="color:var(--text-primary);">${formatBRLFromCents(card.currentInvoiceCents)}</strong></span>
          <span>Disponível: <strong style="color:var(--text-primary);">${formatBRLFromCents(card.availableLimitCents)}</strong> • Venc. dia ${card.dueDay}</span>
        </div>
      </div>`;
    })
    .join('');

  const upcomingHtml = (d.upcomingBills || [])
    .map(
      (b     ) => `
      <div class="upcoming-row">
        <div>
          <div style="font-weight:500;color:var(--text-primary);font-size:0.9rem;">${b.description}</div>
          <div class="text-aux">Vencimento em ${formatDateBR(b.dueDate || b.occurrenceDate)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          ${renderStateChip('pendente', 'Pendente')}
          <span class="money-inline">${formatBRLFromCents(b.amountCents)}</span>
        </div>
      </div>`
    )
    .join('');

  return `<section aria-label="Visão Geral da Saúde Financeira" class="dashboard-grid">
    <!-- TOPO DE DESTAQUE (12 COLUNAS): 1. Disponível para gastar (Prioridade 1), 2. Resultado Mensal (Prioridade 2), 3. Saldo Consolidado, 4. Resumo e Nova Movimentação -->
    <div class="col-span-4 card card-priority">
      <div class="metric-header">
        <span class="card-title">Disponível para gastar no mês</span>
        <span class="icon-badge icon-badge-teal">${LUCIDE_ICONS.sparkles}</span>
      </div>
      <div class="card-value card-value-hero">${formatBRLFromCents(d.availableToSpendMonthCents)}</div>
      <div class="metric-footer">
        ${renderStateChip('estavel', 'Dentro do orçamento')}
        <span class="text-aux">Margem segura até 31/10</span>
      </div>
    </div>

    <div class="col-span-4 card card-priority-secondary">
      <div class="metric-header">
        <span class="card-title">Resultado mensal (Outubro)</span>
        <span class="icon-badge ${isPositiveResult ? 'icon-badge-green' : 'icon-badge-red'}">${isPositiveResult ? LUCIDE_ICONS.trendingUp : LUCIDE_ICONS.trendingDown}</span>
      </div>
      <div class="card-value">${formatBRLFromCents(d.monthlyResultCents)}</div>
      <div class="metric-footer">
        ${resultChip}
        <span class="text-aux">Receitas ${formatBRLFromCents(d.monthIncomeCents)} • Despesas ${formatBRLFromCents(d.monthExpenseCents)}</span>
      </div>
    </div>

    <div class="col-span-4 card" style="display:flex;flex-direction:column;justify-content:space-between;">
      <div>
        <div class="metric-header">
          <span class="card-title">Saldo total consolidado</span>
          <span class="icon-badge">${LUCIDE_ICONS.wallet}</span>
        </div>
        <div class="card-value">${formatBRLFromCents(d.totalBalanceCents)}</div>
        <div class="metric-footer" style="margin-top:8px;">
          ${expTrendChip}
          <span class="text-aux">Contas + Reserva + Investimentos</span>
        </div>
      </div>
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
        <span class="text-aux">Registrar receita ou despesa</span>
        <button type="button" class="btn btn-primary btn-sm" data-nav-tab="transactions">${LUCIDE_ICONS.plus}<span>Nova movimentação</span></button>
      </div>
    </div>

    <!-- INSIGHTS DO DIA COMPACTOS (5 COLUNAS) + GRÁFICO DE GASTOS POR CATEGORIA (7 COLUNAS) -->
    <div class="col-span-5 card">
      <div class="section-header">
        <div>
          <h2 class="section-title">Insights financeiros do dia</h2>
          <p class="text-aux">Até 3 alertas prioritários baseados no seu ritmo atual</p>
        </div>
        <span class="icon-badge icon-badge-teal">${LUCIDE_ICONS.sparkles}</span>
      </div>
      <div class="insights-list">
        ${insightsCardsHtml}
      </div>

      <div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--border-color);">
        <div class="section-header" style="margin-bottom:10px;">
          <h3 class="section-title" style="font-size:0.95rem;">Próximos vencimentos</h3>
          <button type="button" class="link-action" data-nav-tab="transactions">Ver extrato →</button>
        </div>
        ${upcomingHtml || '<p class="text-aux">Nenhuma conta pendente para os próximos dias.</p>'}
      </div>
    </div>

    <div class="col-span-7 card">
      <div class="section-header">
        <div>
          <h2 class="section-title">Para onde seu dinheiro está indo</h2>
          <p class="text-aux">Distribuição de despesas por categoria em Outubro/2026</p>
        </div>
        <button type="button" class="link-action" data-nav-tab="budgets">Ajustar limites →</button>
      </div>

      <!-- Barra empilhada limpa do gráfico de categorias -->
      <div class="stacked-bar" role="img" aria-label="Gráfico de distribuição proporcional de gastos por categoria">
        ${segmentedBarHtml}
      </div>

      <div class="category-list">
        ${catRows}
      </div>
    </div>

    <!-- METAS FINANCEIRAS (7 COLUNAS) + CARTÕES DE CRÉDITO (5 COLUNAS) -->
    <div class="col-span-7 card">
      <div class="section-header">
        <div>
          <h2 class="section-title">Progresso de metas financeiras</h2>
          <p class="text-aux">Acompanhamento de objetivos, prazos e ritmo de aportes</p>
        </div>
        <button type="button" class="link-action" data-nav-tab="goals">Gerenciar metas →</button>
      </div>
      <div class="goals-list">
        ${goalsHtml}
      </div>
    </div>

    <div class="col-span-5 card">
      <div class="section-header">
        <div>
          <h2 class="section-title">Cartões de crédito</h2>
          <p class="text-aux">Fatura aberta e limite disponível</p>
        </div>
        <button type="button" class="link-action" data-nav-tab="accounts">Ver cartões →</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${cardsHtml}
      </div>
    </div>
  </section>`;
}

export function renderWebAppHtml(initialState     , csrfToken        )         {
  const initialStateJson = JSON.stringify(initialState).replace(/</g, '\\u003c');
  const iconsJson = JSON.stringify(LUCIDE_ICONS).replace(/</g, '\\u003c');
  const ssrDashboardHtml = renderDashboardServerSide(initialState);
  const firstName = (initialState.user?.name || 'Mariana').split(' ')[0];

  return `<!DOCTYPE html>
<html lang="pt-BR" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meu Controle Financeiro — Gestão Pessoal Inteligente</title>
  <meta name="description" content="Plataforma web completa de gestão financeira pessoal em português do Brasil. Organize orçamento, metas, cartões e dívidas com segurança e privacidade desde a concepção." />
  <style>
    :root {
      /* Direção Visual Fintech Brasileira de Alto Padrão */
      --bg-app: #F7F9FC;
      --bg-surface: #FFFFFF;
      --bg-muted: #F1F5F9;
      --bg-subtle-teal: #F0FDFA;
      --text-primary: #0F172A;
      --text-secondary: #334155;
      --text-muted: #64748B;
      --border-color: #E7EDF5;
      --border-hover: #CBD5E1;

      /* Cores Semânticas Obrigatórias */
      --brand-primary: #0F766E;
      --brand-primary-hover: #115E59;
      --brand-light: #CCFBF1;

      --color-success: #16A34A;
      --color-success-bg: #DCFCE7;

      --color-danger: #DC2626;
      --color-danger-bg: #FEE2E2;

      --color-warning: #D97706;
      --color-warning-bg: #FEF3C7;

      --color-info: #2563EB;
      --color-info-bg: #DBEAFE;

      --color-neutral: #475569;
      --color-neutral-bg: #F1F5F9;

      --focus-ring: #2563EB;
      --radius-card: 16px;
      --radius-sm: 10px;
      --shadow-card: 0 1px 3px rgba(15, 23, 42, 0.03), 0 4px 12px rgba(15, 23, 42, 0.02);
      --shadow-card-hover: 0 4px 16px rgba(15, 23, 42, 0.06);
      --transition-fast: 170ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    [data-theme="dark"] {
      --bg-app: #0B1120;
      --bg-surface: #131C2E;
      --bg-muted: #1E293B;
      --bg-subtle-teal: #0F292A;
      --text-primary: #F8FAFC;
      --text-secondary: #CBD5E1;
      --text-muted: #94A3B8;
      --border-color: #1E293B;
      --border-hover: #334155;

      --brand-primary: #14B8A6;
      --brand-primary-hover: #2DD4BF;
      --brand-light: #134E4A;

      --color-success: #4ADE80;
      --color-success-bg: rgba(22, 163, 74, 0.18);

      --color-danger: #F87171;
      --color-danger-bg: rgba(220, 38, 38, 0.18);

      --color-warning: #FBBF24;
      --color-warning-bg: rgba(217, 119, 6, 0.18);

      --color-info: #60A5FA;
      --color-info-bg: rgba(37, 99, 235, 0.18);

      --color-neutral: #CBD5E1;
      --color-neutral-bg: rgba(148, 163, 184, 0.14);

      --focus-ring: #60A5FA;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-app);
      color: var(--text-primary);
      line-height: 1.55;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    /* Acessibilidade WCAG 2.2 AA */
    :focus-visible {
      outline: 2.5px solid var(--focus-ring);
      outline-offset: 2px;
    }
    .skip-link {
      position: absolute;
      top: -100px;
      left: 16px;
      background: var(--brand-primary);
      color: #fff;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      z-index: 9999;
      text-decoration: none;
      font-weight: 600;
    }
    .skip-link:focus { top: 12px; }

    /* Shell Principal com Sidebar Compacta e Elegante */
    .app-shell {
      display: grid;
      grid-template-columns: 248px 1fr;
      min-height: 100vh;
    }
    .sidebar {
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 10px 22px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 16px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--brand-primary);
      color: #fff;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 0.95rem;
      letter-spacing: -0.02em;
      box-shadow: 0 2px 6px rgba(15, 118, 110, 0.25);
    }
    .nav-group-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      padding: 8px 12px 6px;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
      margin-bottom: 2px;
    }
    .nav-btn:hover {
      background: var(--bg-muted);
      color: var(--text-primary);
    }
    .nav-btn[aria-current="page"] {
      background: var(--bg-subtle-teal);
      color: var(--brand-primary);
      font-weight: 600;
      border-color: rgba(15, 118, 110, 0.18);
    }
    .sidebar-footer {
      padding: 14px 12px;
      background: var(--bg-app);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Área Principal e Cabeçalho */
    .main-area {
      display: flex;
      flex-direction: column;
      min-width: 0;
      padding-bottom: 88px;
    }
    .topbar {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      padding: 18px 32px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .greeting-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.015em;
    }
    .greeting-sub {
      font-size: 0.86rem;
      font-weight: 400;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 2px;
    }
    .security-pill-discrete {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--bg-muted);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }
    .period-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 7px 13px;
      border-radius: var(--radius-sm);
      background: var(--bg-app);
      border: 1px solid var(--border-color);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .content-container {
      padding: 32px;
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
    }

    /* Grid de 12 Colunas no Desktop */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 22px;
    }
    .col-span-4 { grid-column: span 4 / span 4; }
    .col-span-5 { grid-column: span 5 / span 5; }
    .col-span-6 { grid-column: span 6 / span 6; }
    .col-span-7 { grid-column: span 7 / span 7; }
    .col-span-8 { grid-column: span 8 / span 8; }
    .col-span-12 { grid-column: span 12 / span 12; }

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 22px;
      margin-bottom: 24px;
    }

    /* Cards Premium (cantos 16px, borda #E7EDF5, sombra suave e hover sutil) */
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-card);
      padding: 24px;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
    }
    .card:hover {
      box-shadow: var(--shadow-card-hover);
      border-color: var(--border-hover);
    }
    .card-priority {
      background: linear-gradient(180deg, var(--bg-subtle-teal) 0%, var(--bg-surface) 65%);
      border-color: rgba(15, 118, 110, 0.28);
    }
    .card-priority-secondary {
      border-color: rgba(15, 23, 42, 0.12);
    }
    .subcard {
      padding: 16px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-app);
      transition: border-color var(--transition-fast);
    }
    .subcard:hover { border-color: var(--border-hover); }

    /* Tipografia e Hierarquia dentro dos Cards */
    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.025em;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }
    .card-value-hero {
      font-size: 1.95rem;
      color: var(--brand-primary);
    }
    .metric-footer {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    .text-aux {
      font-size: 0.82rem;
      font-weight: 400;
      color: var(--text-muted);
    }
    .money-inline {
      font-weight: 700;
      font-size: 0.92rem;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    /* Ícones Discretos em Containers */
    .icon-badge {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--bg-muted);
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-badge-teal {
      background: var(--brand-light);
      color: var(--brand-primary);
    }
    .icon-badge-green {
      background: var(--color-success-bg);
      color: var(--color-success);
    }
    .icon-badge-red {
      background: var(--color-danger-bg);
      color: var(--color-danger);
    }

    /* Chips / Pílulas Padronizados (Apenas Estados: Positivo, Atenção, Crítico, Estável, Pendente) */
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
    }
    .chip-positivo { background: var(--color-success-bg); color: var(--color-success); }
    .chip-atencao { background: var(--color-warning-bg); color: var(--color-warning); }
    .chip-critico { background: var(--color-danger-bg); color: var(--color-danger); }
    .chip-estavel { background: var(--color-info-bg); color: var(--color-info); }
    .chip-pendente { background: var(--color-neutral-bg); color: var(--color-neutral); }

    /* Insights Compactos */
    .insights-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .insight-item {
      padding: 14px 16px;
      border-radius: 12px;
      background: var(--bg-app);
      border: 1px solid var(--border-color);
      transition: border-color var(--transition-fast);
    }
    .insight-item:hover { border-color: var(--border-hover); }
    .insight-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .insight-title {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .insight-desc {
      font-size: 0.84rem;
      color: var(--text-secondary);
      font-weight: 400;
    }
    .link-action {
      background: transparent;
      border: none;
      color: var(--brand-primary);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 6px;
    }
    .link-action:hover { text-decoration: underline; }

    /* Gráfico de Gastos por Categoria e Barras de Progresso */
    .stacked-bar {
      display: flex;
      width: 100%;
      height: 12px;
      border-radius: 999px;
      overflow: hidden;
      gap: 3px;
      margin-bottom: 20px;
      background: var(--bg-muted);
    }
    .category-list, .goals-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .category-row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      gap: 8px;
      flex-wrap: wrap;
    }
    .category-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
      display: inline-block;
    }
    .category-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .goal-item {
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-color);
    }
    .goal-item:last-child { border-bottom: none; padding-bottom: 0; }
    .upcoming-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-color);
    }
    .upcoming-row:last-child { border-bottom: none; }

    .progress-track {
      width: 100%;
      height: 8px;
      background: var(--bg-muted);
      border-radius: 999px;
      overflow: hidden;
      margin: 6px 0;
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 200ms ease;
    }

    /* Botões e Controles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 16px;
      border-radius: var(--radius-sm);
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      border: 1px solid var(--border-color);
      background: var(--bg-surface);
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast);
    }
    .btn:hover {
      background: var(--bg-muted);
      border-color: var(--border-hover);
    }
    .btn-sm { padding: 7px 13px; font-size: 0.82rem; }
    .btn-primary {
      background: var(--brand-primary);
      color: #FFFFFF;
      border-color: var(--brand-primary);
    }
    .btn-primary:hover {
      background: var(--brand-primary-hover);
      border-color: var(--brand-primary-hover);
    }
    .btn-danger {
      background: var(--color-danger-bg);
      color: var(--color-danger);
      border-color: transparent;
    }
    .btn-danger:hover {
      background: var(--color-danger);
      color: #FFFFFF;
    }

    /* Sub-navegação em Pílulas para Configurações */
    .subnav-pills {
      display: inline-flex;
      gap: 6px;
      padding: 5px;
      background: var(--bg-muted);
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid var(--border-color);
    }
    .subnav-btn {
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.86rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all var(--transition-fast);
    }
    .subnav-btn[aria-selected="true"] {
      background: var(--bg-surface);
      color: var(--brand-primary);
      box-shadow: var(--shadow-card);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
      min-width: 0;
    }
    .form-group label {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .input, select, textarea {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      padding: 9px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-app);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: inherit;
      text-overflow: ellipsis;
      transition: border-color var(--transition-fast);
    }
    .input:hover, select:hover { border-color: var(--border-hover); }

    .form-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .form-grid-3 {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }

    /* Janela Modal Sobreposta (Histórico Maximizado) */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.58);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      z-index: 2600;
      animation: fadeInModal 160ms ease-out;
    }
    @keyframes fadeInModal {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-window {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      width: 100%;
      max-width: 1180px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 24px 48px rgba(15, 23, 42, 0.28);
      overflow: hidden;
    }
    .modal-header {
      padding: 20px 26px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      background: var(--bg-surface);
    }
    .modal-body {
      padding: 22px 26px;
      overflow-y: auto;
      flex: 1;
    }
    .compact-tx-list {
      display: flex;
      flex-direction: column;
    }
    .compact-tx-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px 4px;
      border-bottom: 1px solid var(--border-color);
    }
    .compact-tx-item:last-child {
      border-bottom: none;
    }

    /* Tabelas Limpas */
    .table-wrap { overflow-x: auto; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    th, td {
      padding: 12px 14px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }
    th {
      font-weight: 600;
      font-size: 0.8rem;
      color: var(--text-muted);
      background: var(--bg-app);
    }

    /* Skeleton Loading */
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skeleton-box {
      height: 120px;
      border-radius: var(--radius-card);
      background: linear-gradient(90deg, var(--bg-muted) 25%, var(--border-color) 50%, var(--bg-muted) 75%);
      background-size: 800px 100%;
      animation: shimmer 1.2s infinite linear;
    }

    /* Notificações / Toasts */
    .undo-banner {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--text-primary);
      color: var(--bg-surface);
      padding: 14px 20px;
      border-radius: 12px;
      display: none;
      align-items: center;
      gap: 14px;
      z-index: 2000;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.2);
    }
    .toast-feedback {
      position: fixed;
      top: 20px;
      right: 24px;
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--brand-primary);
      border-left: 4px solid var(--brand-primary);
      padding: 12px 18px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.88rem;
      display: none;
      z-index: 3000;
      box-shadow: var(--shadow-card-hover);
    }

    /* Navegação Inferior Mobile */
    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      padding: 6px 8px;
      z-index: 1000;
      justify-content: space-around;
    }
    @media (max-width: 1024px) {
      .col-span-4, .col-span-5, .col-span-6, .col-span-7, .col-span-8 {
        grid-column: span 12 / span 12;
      }
    }
    @media (max-width: 900px) {
      .app-shell { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .mobile-bottom-nav { display: flex; }
      .topbar { padding: 14px 20px; }
      .content-container { padding: 20px; }
      .grid-2 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Pular para o conteúdo principal</a>

  <div id="toast-feedback" class="toast-feedback" role="status" aria-live="polite"></div>

  <div class="app-shell">
    <!-- Sidebar Fixa, Elegante e Compacta com Lucide Icons -->
    <aside class="sidebar" aria-label="Menu principal lateral">
      <div>
        <div class="brand-header">
          <div class="brand-logo" aria-hidden="true">MC</div>
          <div>
            <div style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary); letter-spacing: -0.01em;">Meu Controle</div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Finanças Pessoais</div>
          </div>
        </div>

        <nav aria-label="Navegação da Plataforma">
          <div class="nav-group-label">Planejamento</div>
          <button type="button" class="nav-btn" data-nav-tab="dashboard" aria-current="page">${LUCIDE_ICONS.layoutDashboard}<span>Visão geral</span></button>
          <button type="button" class="nav-btn" data-nav-tab="transactions">${LUCIDE_ICONS.arrowLeftRight}<span>Movimentações</span></button>
          <button type="button" class="nav-btn" data-nav-tab="accounts">${LUCIDE_ICONS.creditCard}<span>Contas e cartões</span></button>
          <button type="button" class="nav-btn" data-nav-tab="budgets">${LUCIDE_ICONS.pieChart}<span>Orçamentos</span></button>
          <button type="button" class="nav-btn" data-nav-tab="goals">${LUCIDE_ICONS.target}<span>Metas financeiras</span></button>
          <button type="button" class="nav-btn" data-nav-tab="debts">${LUCIDE_ICONS.trendingDown}<span>Dívidas e simulador</span></button>
          <button type="button" class="nav-btn" data-nav-tab="reports">${LUCIDE_ICONS.barChart3}<span>Relatórios</span></button>

          <div class="nav-group-label" style="margin-top: 12px;">Conta e Privacidade</div>
          <button type="button" class="nav-btn" data-nav-tab="settings">${LUCIDE_ICONS.settings}<span>Configurações</span></button>
        </nav>
      </div>

      <!-- Aviso de Segurança e Dados Demo Discreto e Não Intrusivo -->
      <div class="sidebar-footer" role="region" aria-label="Status de segurança e privacidade">
        <div style="display:flex;align-items:center;gap:6px;font-weight:600;color:var(--brand-primary);">
          ${LUCIDE_ICONS.shieldCheck}
          <span>Ambiente protegido</span>
        </div>
        <span>Criptografia AES-256 • LGPD</span>
        <span style="font-size:0.72rem;">Dados fictícios [EXEMPLO / DEMO]</span>
      </div>
    </aside>

    <div class="main-area">
      <!-- Cabeçalho Principal com Saudação, Período Selecionado e Ações Principais -->
      <header class="topbar">
        <div>
          <h1 id="page-heading" class="greeting-title">Olá, ${firstName} — Meu Controle Financeiro</h1>
          <div class="greeting-sub">
            <span id="user-welcome-label">Visão consolidada da sua saúde financeira</span>
            <span class="security-pill-discrete" title="Sessão protegida com Argon2id, AES-256-GCM e conformidade LGPD">${LUCIDE_ICONS.shieldCheck}<span>Conta demonstração segura</span></span>
          </div>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <div class="period-pill" aria-label="Período selecionado: Outubro de 2026">
            ${LUCIDE_ICONS.calendar}
            <span>Outubro de 2026</span>
          </div>
          <button type="button" class="btn" data-action="toggle-theme" id="theme-toggle-btn" aria-label="Alternar entre modo claro e escuro">${LUCIDE_ICONS.moon}<span>Modo escuro</span></button>
          <button type="button" class="btn btn-primary" data-nav-tab="transactions">${LUCIDE_ICONS.plus}<span>Nova movimentação</span></button>
        </div>
      </header>

      <main id="main-content" class="content-container" tabindex="-1">
        <div id="view-root">${ssrDashboardHtml}</div>
      </main>
    </div>
  </div>

  <!-- Navegação Inferior Mobile -->
  <nav class="mobile-bottom-nav" aria-label="Navegação móvel inferior">
    <button type="button" class="nav-btn" data-nav-tab="dashboard" style="flex-direction:column;font-size:0.72rem;padding:6px;align-items:center;gap:4px;">${LUCIDE_ICONS.layoutDashboard}<span>Início</span></button>
    <button type="button" class="nav-btn" data-nav-tab="transactions" style="flex-direction:column;font-size:0.72rem;padding:6px;align-items:center;gap:4px;">${LUCIDE_ICONS.arrowLeftRight}<span>Extrato</span></button>
    <button type="button" class="nav-btn" data-nav-tab="budgets" style="flex-direction:column;font-size:0.72rem;padding:6px;align-items:center;gap:4px;">${LUCIDE_ICONS.pieChart}<span>Orçamento</span></button>
    <button type="button" class="nav-btn" data-nav-tab="goals" style="flex-direction:column;font-size:0.72rem;padding:6px;align-items:center;gap:4px;">${LUCIDE_ICONS.target}<span>Metas</span></button>
    <button type="button" class="nav-btn" data-nav-tab="settings" style="flex-direction:column;font-size:0.72rem;padding:6px;align-items:center;gap:4px;">${LUCIDE_ICONS.settings}<span>Ajustes</span></button>
  </nav>

  <!-- Toast para Desfazer Exclusão Recente -->
  <div id="undo-banner" class="undo-banner" role="status" aria-live="polite">
    <span id="undo-message">Movimentação excluída.</span>
    <button type="button" class="btn btn-primary btn-sm" data-action="undo-delete">Desfazer exclusão</button>
  </div>

  <script id="app-client-script">
    window.__INITIAL_STATE__ = ${initialStateJson};
    window.__ICONS__ = ${iconsJson};
    window.__CSRF_TOKEN__ = "${csrfToken}";
    var appState = window.__INITIAL_STATE__;
    var ICONS = window.__ICONS__;
    var currentTab = "dashboard";
    var settingsSubTab = "profile";
    var isHistoryMaximized = false;
    var lastDeletedTxId = null;
    var txSearchFilter = "";
    var txStatusFilter = "";

    function formatBRL(cents) {
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((Number(cents) || 0) / 100);
    }

    function formatDateBR(iso) {
      if (!iso) return "--/--/----";
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "--/--/----";
      return String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0") + "/" + d.getUTCFullYear();
    }

    function renderChip(type, label) {
      var cfg = {
        positivo: { cls: "chip-positivo", icon: ICONS.checkCircle, text: "Positivo" },
        atencao: { cls: "chip-atencao", icon: ICONS.alertTriangle, text: "Atenção" },
        critico: { cls: "chip-critico", icon: ICONS.alertCircle, text: "Crítico" },
        estavel: { cls: "chip-estavel", icon: ICONS.minusCircle, text: "Estável" },
        pendente: { cls: "chip-pendente", icon: ICONS.clock, text: "Pendente" }
      }[type] || { cls: "chip-estavel", icon: ICONS.minusCircle, text: "Estável" };
      return '<span class="chip ' + cfg.cls + '">' + cfg.icon + '<span>' + (label || cfg.text) + '</span></span>';
    }

    function showToast(msg) {
      var el = document.getElementById("toast-feedback");
      if (!el) return;
      el.textContent = msg;
      el.style.display = "block";
      setTimeout(function() { el.style.display = "none"; }, 3500);
    }

    function showSkeletonLoading() {
      var root = document.getElementById("view-root");
      if (!root) return;
      root.innerHTML = '<div class="dashboard-grid" aria-busy="true" aria-label="Carregando informações financeiras">' +
        '<div class="col-span-4 skeleton-box"></div>' +
        '<div class="col-span-4 skeleton-box"></div>' +
        '<div class="col-span-4 skeleton-box"></div>' +
        '<div class="col-span-12 skeleton-box" style="height:260px;"></div>' +
      '</div>';
    }

    function toggleTheme() {
      var html = document.documentElement;
      var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      var btn = document.getElementById("theme-toggle-btn");
      if (btn) {
        btn.innerHTML = ICONS.moon + '<span>' + (next === "dark" ? "Modo claro" : "Modo escuro") + '</span>';
      }
    }

    function switchTab(tab) {
      if (tab === "onboarding") { currentTab = "settings"; settingsSubTab = "profile"; }
      else if (tab === "security") { currentTab = "settings"; settingsSubTab = "security"; }
      else if (tab === "privacy") { currentTab = "settings"; settingsSubTab = "privacy"; }
      else { currentTab = tab; }

      var buttons = document.querySelectorAll(".sidebar [data-nav-tab]");
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        if (b.getAttribute("data-nav-tab") === currentTab) {
          b.setAttribute("aria-current", "page");
        } else {
          b.removeAttribute("aria-current");
        }
      }
      renderCurrentTab();
    }

    async function refreshState() {
      showSkeletonLoading();
      var res = await fetch("/api/v1/state");
      if (res.ok) {
        appState = await res.json();
        renderCurrentTab();
      }
    }

    function renderCurrentTab() {
      var root = document.getElementById("view-root");
      if (!root) return;

      if (currentTab === "dashboard") root.innerHTML = renderDashboard();
      else if (currentTab === "transactions") root.innerHTML = renderTransactions();
      else if (currentTab === "accounts") root.innerHTML = renderAccountsAndCards();
      else if (currentTab === "budgets") root.innerHTML = renderBudgets();
      else if (currentTab === "goals") root.innerHTML = renderGoals();
      else if (currentTab === "debts") root.innerHTML = renderDebts();
      else if (currentTab === "reports") root.innerHTML = renderReports();
      else if (currentTab === "settings") root.innerHTML = renderSettingsHub();
    }

    function renderDashboard() {
      var d = appState.dashboard;
      var isPositive = d.monthlyResultCents >= 0;
      var resultChip = isPositive
        ? renderChip("positivo", "Positivo (+" + d.savingsRatePercentage + "% poupado)")
        : renderChip("critico", "Resultado negativo");

      var expComp = d.expenseComparisonPrevMonthPct || 0;
      var expTrendChip = expComp > 10
        ? renderChip("atencao", "+" + expComp + "% vs set/26")
        : expComp < 0
          ? renderChip("positivo", expComp + "% vs set/26")
          : renderChip("estavel", "Estável vs set/26");

      var rawInsights = (d.dailyInsights || []).slice(0, 3);
      var insightsHtml = rawInsights.map(function(text, idx) {
        var lower = text.toLowerCase();
        var item = {
          chip: renderChip(idx === 0 ? "estavel" : "positivo"),
          title: "Resumo financeiro",
          desc: text,
          tab: "reports"
        };
        if (lower.indexOf("alimentação") !== -1) {
          item = { chip: renderChip("atencao"), title: "Variação em Alimentação", desc: text, tab: "transactions" };
        } else if (lower.indexOf("orçamento") !== -1 || lower.indexOf("transporte") !== -1) {
          item = { chip: renderChip("atencao"), title: "Limite de orçamento próximo", desc: text, tab: "budgets" };
        } else if (lower.indexOf("meta") !== -1 || lower.indexOf("reserva") !== -1) {
          item = { chip: renderChip("positivo"), title: "Meta quase concluída", desc: text, tab: "goals" };
        }
        return '<div class="insight-item">' +
          '<div class="insight-item-top">' +
            '<div style="display:flex;align-items:center;gap:8px;">' + item.chip + '<span class="insight-title">' + item.title + '</span></div>' +
            '<button type="button" class="link-action" data-nav-tab="' + item.tab + '">Ver detalhes →</button>' +
          '</div>' +
          '<p class="insight-desc">' + item.desc + '</p>' +
        '</div>';
      }).join("");

      var segmentedBarHtml = (d.expensesByCategory || []).map(function(c) {
        return '<div style="width:' + Math.max(3, c.sharePct) + '%;background:' + c.color + ';height:100%;" title="' + c.categoryName + ': ' + c.sharePct + '%"></div>';
      }).join("");

      var catRows = (d.expensesByCategory || []).map(function(c) {
        var stateChip = c.variationPct > 10
          ? renderChip("atencao", "+" + c.variationPct + "% vs mês ant.")
          : renderChip("estavel", "Estável");
        return '<div class="category-row">' +
          '<div class="category-row-header">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span class="category-dot" style="background:' + c.color + ';"></span>' +
              '<span class="category-name">' + c.categoryName + '</span>' +
              '<span class="text-aux">' + c.sharePct + '% do total</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              stateChip +
              '<span class="money-inline">' + formatBRL(c.spentCents) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="progress-track" role="progressbar" aria-label="Gasto em ' + c.categoryName + '" aria-valuenow="' + c.sharePct + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="progress-fill" style="width:' + Math.min(100, c.sharePct) + '%;background:' + c.color + ';"></div>' +
          '</div>' +
        '</div>';
      }).join("");

      var upcomingHtml = (d.upcomingBills || []).map(function(b) {
        return '<div class="upcoming-row">' +
          '<div><div style="font-weight:500;color:var(--text-primary);font-size:0.9rem;">' + b.description + '</div><div class="text-aux">Vencimento em ' + formatDateBR(b.dueDate || b.occurrenceDate) + '</div></div>' +
          '<div style="display:flex;align-items:center;gap:10px;">' + renderChip("pendente") + '<span class="money-inline">' + formatBRL(b.amountCents) + '</span></div>' +
        '</div>';
      }).join("");

      var goalsHtml = (d.goalProjections || []).map(function(g) {
        var gChip = g.progressPercentage >= 100 ? renderChip("positivo") : g.onTrack ? renderChip("estavel") : renderChip("atencao");
        return '<div class="goal-item">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">' +
            '<div>' +
              '<div style="font-weight:600;color:var(--text-primary);font-size:0.95rem;">' + g.name + '</div>' +
              '<div class="text-aux">Prazo: ' + g.monthsUntilDeadline + ' mes(es) • Acumulado: <strong style="color:var(--text-primary);">' + formatBRL(g.currentAmountCents) + '</strong> de ' + formatBRL(g.targetAmountCents) + '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;">' +
              '<span style="font-weight:700;font-size:0.92rem;color:var(--brand-primary);">' + g.progressPercentage + '%</span>' +
              gChip +
            '</div>' +
          '</div>' +
          '<div class="progress-track" role="progressbar" aria-label="Progresso da meta ' + g.name + '" aria-valuenow="' + g.progressPercentage + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="progress-fill" style="width:' + g.progressPercentage + '%;background:var(--brand-primary);"></div>' +
          '</div>' +
          '<p class="text-aux" style="margin-top:4px;">' + g.recommendationMessage + '</p>' +
        '</div>';
      }).join("");

      var cardsHtml = (d.creditCardsSummary || []).map(function(card) {
        var cChip = card.highUsageAlert
          ? renderChip("critico", card.usagePercentage + "% utilizado")
          : renderChip("estavel", card.usagePercentage + "% utilizado");
        return '<div class="subcard">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--text-primary);">' +
              '<span class="icon-badge">' + ICONS.creditCard + '</span>' +
              '<span>' + card.name + ' <span class="text-aux">•••• ' + card.lastFourDigits + '</span></span>' +
            '</div>' +
            cChip +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:0.86rem;color:var(--text-secondary);">' +
            '<span>Fatura atual: <strong style="color:var(--text-primary);">' + formatBRL(card.currentInvoiceCents) + '</strong></span>' +
            '<span>Disponível: <strong style="color:var(--text-primary);">' + formatBRL(card.availableLimitCents) + '</strong> • Venc. dia ' + card.dueDay + '</span>' +
          '</div>' +
        '</div>';
      }).join("");

      return '<section aria-label="Visão Geral da Saúde Financeira" class="dashboard-grid">' +
        '<div class="col-span-4 card card-priority">' +
          '<div class="metric-header"><span class="card-title">Disponível para gastar no mês</span><span class="icon-badge icon-badge-teal">' + ICONS.sparkles + '</span></div>' +
          '<div class="card-value card-value-hero">' + formatBRL(d.availableToSpendMonthCents) + '</div>' +
          '<div class="metric-footer">' + renderChip("estavel", "Dentro do orçamento") + '<span class="text-aux">Margem segura até 31/10</span></div>' +
        '</div>' +
        '<div class="col-span-4 card card-priority-secondary">' +
          '<div class="metric-header"><span class="card-title">Resultado mensal (Outubro)</span><span class="icon-badge ' + (isPositive ? "icon-badge-green" : "icon-badge-red") + '">' + (isPositive ? ICONS.trendingUp : ICONS.trendingDown) + '</span></div>' +
          '<div class="card-value">' + formatBRL(d.monthlyResultCents) + '</div>' +
          '<div class="metric-footer">' + resultChip + '<span class="text-aux">Receitas ' + formatBRL(d.monthIncomeCents) + ' • Despesas ' + formatBRL(d.monthExpenseCents) + '</span></div>' +
        '</div>' +
        '<div class="col-span-4 card" style="display:flex;flex-direction:column;justify-content:space-between;">' +
          '<div>' +
            '<div class="metric-header"><span class="card-title">Saldo total consolidado</span><span class="icon-badge">' + ICONS.wallet + '</span></div>' +
            '<div class="card-value">' + formatBRL(d.totalBalanceCents) + '</div>' +
            '<div class="metric-footer" style="margin-top:8px;">' + expTrendChip + '<span class="text-aux">Contas + Reserva + Investimentos</span></div>' +
          '</div>' +
          '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">' +
            '<span class="text-aux">Registrar receita ou despesa</span>' +
            '<button type="button" class="btn btn-primary btn-sm" data-nav-tab="transactions">' + ICONS.plus + '<span>Nova movimentação</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="col-span-5 card">' +
          '<div class="section-header"><div><h2 class="section-title">Insights financeiros do dia</h2><p class="text-aux">Até 3 alertas prioritários baseados no seu ritmo atual</p></div><span class="icon-badge icon-badge-teal">' + ICONS.sparkles + '</span></div>' +
          '<div class="insights-list">' + insightsHtml + '</div>' +
          '<div style="margin-top:24px;padding-top:18px;border-top:1px solid var(--border-color);">' +
            '<div class="section-header" style="margin-bottom:10px;"><h3 class="section-title" style="font-size:0.95rem;">Próximos vencimentos</h3><button type="button" class="link-action" data-nav-tab="transactions">Ver extrato →</button></div>' +
            (upcomingHtml || '<p class="text-aux">Nenhuma conta pendente para os próximos dias.</p>') +
          '</div>' +
        '</div>' +
        '<div class="col-span-7 card">' +
          '<div class="section-header"><div><h2 class="section-title">Para onde seu dinheiro está indo</h2><p class="text-aux">Distribuição de despesas por categoria em Outubro/2026</p></div><button type="button" class="link-action" data-nav-tab="budgets">Ajustar limites →</button></div>' +
          '<div class="stacked-bar" role="img" aria-label="Gráfico de distribuição proporcional de gastos por categoria">' + segmentedBarHtml + '</div>' +
          '<div class="category-list">' + catRows + '</div>' +
        '</div>' +
        '<div class="col-span-7 card">' +
          '<div class="section-header"><div><h2 class="section-title">Progresso de metas financeiras</h2><p class="text-aux">Acompanhamento de objetivos, prazos e ritmo de aportes</p></div><button type="button" class="link-action" data-nav-tab="goals">Gerenciar metas →</button></div>' +
          '<div class="goals-list">' + goalsHtml + '</div>' +
        '</div>' +
        '<div class="col-span-5 card">' +
          '<div class="section-header"><div><h2 class="section-title">Cartões de crédito</h2><p class="text-aux">Fatura aberta e limite disponível</p></div><button type="button" class="link-action" data-nav-tab="accounts">Ver cartões →</button></div>' +
          '<div style="display:flex;flex-direction:column;gap:12px;">' + cardsHtml + '</div>' +
        '</div>' +
      '</section>';
    }

    function renderTransactions() {
      var catOptions = appState.categories.map(function(c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
      }).join("");
      var accOptions = appState.accounts.map(function(a) {
        return '<option value="' + a.id + '">' + a.name + '</option>';
      }).join("");

      var filtered = appState.transactions.filter(function(t) {
        if (txStatusFilter && t.status !== txStatusFilter) return false;
        if (txSearchFilter && t.description.toLowerCase().indexOf(txSearchFilter.toLowerCase()) === -1) return false;
        return true;
      });

      // Lista compacta (5 itens mais recentes) para o card reduzido
      var compactSlice = filtered.slice(0, 5);
      var compactItemsHtml = compactSlice.map(function(t) {
        var cat = appState.categories.find(function(c) { return c.id === t.categoryId; });
        var isIncome = t.type === "INCOME";
        var statusChip = t.status === "PAID"
          ? renderChip("positivo", "Pago")
          : t.status === "OVERDUE"
            ? renderChip("critico", "Atrasado")
            : renderChip("pendente", "Pendente");
        return '<div class="compact-tx-item">' +
          '<div style="min-width:0;flex:1;">' +
            '<div style="font-weight:600;color:var(--text-primary);font-size:0.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + t.description + (t.installmentTotal > 1 ? ' <span class="text-aux">(' + t.installmentTotal + 'x)</span>' : '') + '</div>' +
            '<div class="text-aux">' + formatDateBR(t.occurrenceDate) + ' • ' + (cat ? cat.name : "Outros") + ' • ' + t.paymentMethod + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">' +
            statusChip +
            '<span class="money-inline" style="min-width:96px;text-align:right;color:' + (isIncome ? "var(--color-success)" : "var(--text-primary)") + ';">' + (isIncome ? "+" : "-") + formatBRL(t.amountCents) + '</span>' +
            '<button type="button" class="btn btn-danger btn-sm" title="Excluir movimentação" data-action="delete-tx" data-id="' + t.id + '">Excluir</button>' +
          '</div>' +
        '</div>';
      }).join("");

      // Linhas completas para a janela modal maximizada
      var fullRowsHtml = filtered.map(function(t) {
        var cat = appState.categories.find(function(c) { return c.id === t.categoryId; });
        var isIncome = t.type === "INCOME";
        var statusChip = t.status === "PAID"
          ? renderChip("positivo", "Pago")
          : t.status === "OVERDUE"
            ? renderChip("critico", "Atrasado")
            : renderChip("pendente", "Pendente");
        return '<tr>' +
          '<td class="text-aux" style="white-space:nowrap;">' + formatDateBR(t.occurrenceDate) + '</td>' +
          '<td><strong style="font-weight:600;color:var(--text-primary);">' + t.description + '</strong>' + (t.installmentTotal > 1 ? ' <span class="text-aux">(' + t.installmentTotal + 'x)</span>' : '') + '</td>' +
          '<td>' + (cat ? cat.name : "Outros") + (t.autoClassified ? ' <span class="text-aux" title="Classificado automaticamente">• Auto</span>' : '') + '</td>' +
          '<td class="text-aux">' + t.paymentMethod + '</td>' +
          '<td>' + statusChip + '</td>' +
          '<td class="money-inline" style="white-space:nowrap;color:' + (isIncome ? "var(--color-success)" : "var(--text-primary)") + ';">' + (isIncome ? "+" : "-") + formatBRL(t.amountCents) + '</td>' +
          '<td style="white-space:nowrap;">' +
            '<button type="button" class="btn btn-sm" data-action="duplicate-tx" data-id="' + t.id + '">Duplicar</button> ' +
            '<button type="button" class="btn btn-danger btn-sm" data-action="delete-tx" data-id="' + t.id + '">Excluir</button>' +
          '</td>' +
        '</tr>';
      }).join("");

      var modalHtml = "";
      if (isHistoryMaximized) {
        modalHtml = '<div class="modal-backdrop" data-action="backdrop-close-modal" role="dialog" aria-modal="true" aria-label="Janela de Histórico Completo de Movimentações">' +
          '<div class="modal-window">' +
            '<div class="modal-header">' +
              '<div>' +
                '<h2 class="section-title" style="font-size:1.15rem;">Histórico completo de movimentações (' + filtered.length + ')</h2>' +
                '<p class="text-aux">Visualize, filtre, duplique ou exporte todos os seus lançamentos</p>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
                '<a href="/api/v1/transactions/export-csv" class="btn btn-sm" download="transacoes-meu-controle.csv">' + ICONS.download + '<span>Exportar CSV</span></a>' +
                '<button type="button" class="btn btn-primary btn-sm" data-action="close-history-modal">' + ICONS.minimize2 + '<span>Minimizar / Fechar</span></button>' +
              '</div>' +
            '</div>' +
            '<div class="modal-body">' +
              '<div style="display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap;">' +
                '<input class="input" style="flex:1;min-width:220px;" placeholder="Buscar por descrição..." value="' + txSearchFilter + '" data-input="filter-tx-search" />' +
                '<select style="width:210px;" data-input="filter-tx-status"><option value="">Todos os status</option><option value="PAID" ' + (txStatusFilter === "PAID" ? "selected" : "") + '>Pagos</option><option value="PENDING" ' + (txStatusFilter === "PENDING" ? "selected" : "") + '>Pendentes</option></select>' +
              '</div>' +
              '<div class="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Meio</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead><tbody>' + fullRowsHtml + '</tbody></table></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      return '<div class="dashboard-grid">' +
        '<div class="col-span-5 card">' +
          '<div class="section-header"><div><h2 class="section-title">Registrar movimentação</h2><p class="text-aux">A categoria é sugerida automaticamente pela descrição</p></div></div>' +
          '<form data-form="create-transaction">' +
            '<div class="form-group"><label for="tx-desc">Descrição</label><input id="tx-desc" class="input" required placeholder="Ex: Supermercado, Uber, Netflix, Salário..." data-input="smart-desc" /></div>' +
            '<div id="smart-cat-hint" style="font-size:0.82rem;color:var(--brand-primary);margin-bottom:10px;font-weight:600;"></div>' +
            '<div class="form-grid-2">' +
              '<div class="form-group"><label for="tx-type">Tipo</label><select id="tx-type"><option value="EXPENSE">Despesa</option><option value="INCOME">Receita</option><option value="INVESTMENT">Investimento</option><option value="TRANSFER">Transferência</option><option value="DEBT_PAYMENT">Pagamento de dívida</option></select></div>' +
              '<div class="form-group"><label for="tx-amount">Valor (R$)</label><input id="tx-amount" type="number" step="0.01" min="0.01" class="input" required placeholder="150.00" /></div>' +
            '</div>' +
            '<div class="form-grid-2">' +
              '<div class="form-group"><label for="tx-cat">Categoria</label><select id="tx-cat"><option value="">Sugerir automaticamente</option>' + catOptions + '</select></div>' +
              '<div class="form-group"><label for="tx-method">Meio de pagamento</label><select id="tx-method"><option value="PIX">PIX</option><option value="CREDIT">Cartão de crédito</option><option value="DEBIT">Cartão de débito</option><option value="BOLETO">Boleto</option><option value="CASH">Dinheiro</option><option value="TRANSFER">Transferência</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label for="tx-acc">Conta ou carteira vinculada</label><select id="tx-acc">' + accOptions + '</select></div>' +
            '<div class="form-grid-2">' +
              '<div class="form-group"><label for="tx-inst">Número de parcelas</label><input id="tx-inst" type="number" min="1" max="48" value="1" class="input" /></div>' +
              '<div class="form-group"><label for="tx-status">Situação</label><select id="tx-status"><option value="PAID">Pago / Recebido</option><option value="PENDING">Pendente</option><option value="SCHEDULED">Agendado</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label for="tx-tags">Tags opcionais</label><input id="tx-tags" class="input" placeholder="Ex: mercado, essencial, familia" /></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px;">Salvar movimentação</button>' +
          '</form>' +
        '</div>' +
        '<div class="col-span-7 card" style="display:flex;flex-direction:column;justify-content:space-between;">' +
          '<div>' +
            '<div class="section-header">' +
              '<div><h2 class="section-title">Histórico recente (' + compactSlice.length + ' de ' + filtered.length + ')</h2><p class="text-aux">Resumo compacto dos últimos lançamentos</p></div>' +
              '<div style="display:flex;gap:8px;align-items:center;">' +
                '<a href="/api/v1/transactions/export-csv" class="btn btn-sm" download="transacoes-meu-controle.csv">' + ICONS.download + '<span>CSV</span></a>' +
                '<button type="button" class="btn btn-primary btn-sm" data-action="open-history-modal" aria-label="Maximizar histórico de movimentações">' + ICONS.maximize2 + '<span>Maximizar</span></button>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;margin-bottom:14px;">' +
              '<input class="input" style="flex:1;" placeholder="Buscar por descrição..." value="' + txSearchFilter + '" data-input="filter-tx-search" />' +
              '<select style="width:170px;" data-input="filter-tx-status"><option value="">Todos os status</option><option value="PAID" ' + (txStatusFilter === "PAID" ? "selected" : "") + '>Pagos</option><option value="PENDING" ' + (txStatusFilter === "PENDING" ? "selected" : "") + '>Pendentes</option></select>' +
            '</div>' +
            '<div class="compact-tx-list">' +
              (compactItemsHtml || '<p class="text-aux" style="padding:16px 0;">Nenhuma movimentação encontrada para este filtro.</p>') +
            '</div>' +
          '</div>' +
          '<div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">' +
            '<span class="text-aux">Exibindo ' + compactSlice.length + ' de ' + filtered.length + ' movimentações registradas</span>' +
            '<button type="button" class="btn btn-sm" data-action="open-history-modal">' + ICONS.maximize2 + '<span>Abrir histórico completo (' + filtered.length + ')</span></button>' +
          '</div>' +
        '</div>' +
      '</div>' + modalHtml;
    }

    function renderAccountsAndCards() {
      var accHtml = appState.accounts.map(function(a) {
        return '<div class="card">' +
          '<div class="metric-header"><span class="card-title">' + a.institutionName + '</span><span class="icon-badge">' + ICONS.wallet + '</span></div>' +
          '<div style="font-weight:600;font-size:0.96rem;margin-bottom:6px;color:var(--text-primary);">' + a.name + '</div>' +
          '<div class="card-value">' + formatBRL(a.currentBalanceCents) + '</div>' +
          '<div class="metric-footer">' + renderChip("estavel", a.type) + '</div>' +
        '</div>';
      }).join("");

      var cardHtml = appState.dashboard.creditCardsSummary.map(function(c) {
        var cChip = c.highUsageAlert
          ? renderChip("critico", c.usagePercentage + "% utilizado")
          : renderChip("estavel", c.usagePercentage + "% utilizado");
        return '<div class="card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<span class="icon-badge icon-badge-teal">' + ICONS.creditCard + '</span>' +
              '<div><div style="font-weight:600;color:var(--text-primary);">' + c.name + '</div><div class="text-aux">' + c.brand + ' •••• ' + c.lastFourDigits + ' • Fecha dia ' + c.closingDay + ' • Vence dia ' + c.dueDay + '</div></div>' +
            '</div>' +
            cChip +
          '</div>' +
          '<div class="progress-track" style="margin:14px 0;"><div class="progress-fill" style="width:' + Math.min(100, c.usagePercentage) + '%;background:' + (c.highUsageAlert ? "var(--color-danger)" : "var(--brand-primary)") + ';"></div></div>' +
          '<div style="display:flex;justify-content:space-between;font-size:0.88rem;color:var(--text-secondary);">' +
            '<span>Fatura atual: <strong style="color:var(--text-primary);">' + formatBRL(c.currentInvoiceCents) + '</strong></span>' +
            '<span>Disponível: <strong style="color:var(--text-primary);">' + formatBRL(c.availableLimitCents) + '</strong> de ' + formatBRL(c.totalLimitCents) + '</span>' +
          '</div>' +
        '</div>';
      }).join("");

      return '<div class="section-header"><div><h2 class="section-title">Contas bancárias, carteiras e investimentos</h2><p class="text-aux">Saldos consolidados por instituição</p></div></div>' +
        '<div class="grid-cards">' + accHtml + '</div>' +
        '<div class="grid-2">' +
          '<div class="card">' +
            '<h3 class="section-title" style="margin-bottom:12px;">Nova conta ou carteira</h3>' +
            '<form data-form="create-account">' +
              '<div class="form-group"><label>Nome da conta</label><input id="acc-name" class="input" required placeholder="Ex: Conta Poupança Familiar [DEMO]" /></div>' +
              '<div class="form-grid-2">' +
                '<div class="form-group"><label>Tipo</label><select id="acc-type"><option value="CHECKING">Conta corrente</option><option value="DIGITAL_ACCOUNT">Conta digital</option><option value="SAVINGS">Poupança</option><option value="CASH_WALLET">Carteira em dinheiro</option><option value="INVESTMENT">Investimentos</option></select></div>' +
                '<div class="form-group"><label>Saldo inicial (R$)</label><input id="acc-balance" type="number" step="0.01" value="500.00" class="input" required /></div>' +
              '</div>' +
              '<button type="submit" class="btn btn-primary">Adicionar conta</button>' +
            '</form>' +
          '</div>' +
          '<div class="card">' +
            '<h3 class="section-title" style="margin-bottom:12px;">Novo cartão de crédito</h3>' +
            '<form data-form="create-card">' +
              '<div class="form-group"><label>Nome do cartão</label><input id="card-name" class="input" required placeholder="Ex: Cartão Benefícios [DEMO]" /></div>' +
              '<div class="form-grid-3">' +
                '<div class="form-group"><label>Limite total (R$)</label><input id="card-limit" type="number" step="0.01" value="3000.00" class="input" required /></div>' +
                '<div class="form-group"><label>Fechamento</label><input id="card-close" type="number" min="1" max="31" value="20" class="input" required /></div>' +
                '<div class="form-group"><label>Vencimento</label><input id="card-due" type="number" min="1" max="31" value="28" class="input" required /></div>' +
              '</div>' +
              '<button type="submit" class="btn btn-primary">Adicionar cartão</button>' +
            '</form>' +
          '</div>' +
        '</div>' +
        '<div class="section-header" style="margin-top:8px;"><div><h2 class="section-title">Cartões de crédito cadastrados</h2><p class="text-aux">Acompanhamento de limite e faturas</p></div></div>' +
        '<div class="grid-2">' + cardHtml + '</div>';
    }

    function renderBudgets() {
      var catOptions = appState.categories.filter(function(c) { return c.type === "EXPENSE"; }).map(function(c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
      }).join("");

      var items = appState.dashboard.budgetAnalyses.map(function(b) {
        var bChip = b.alertLevel === "EXCEEDED" || b.alertLevel === "ALERT_100"
          ? renderChip("critico", b.percentageUsed + "% utilizado")
          : b.alertLevel === "ALERT_80"
            ? renderChip("atencao", b.percentageUsed + "% utilizado")
            : renderChip("estavel", b.percentageUsed + "% utilizado");
        return '<div class="card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h3 class="section-title">' + b.categoryName + '</h3>' +
            bChip +
          '</div>' +
          '<div class="progress-track" style="margin:12px 0;" role="progressbar" aria-valuenow="' + b.percentageUsed + '" aria-valuemin="0" aria-valuemax="100">' +
            '<div class="progress-fill" style="width:' + Math.min(100, b.percentageUsed) + '%;background:var(--brand-primary);"></div>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:0.86rem;margin-top:10px;">' +
            '<div><span class="text-aux">Planejado</span><br/><strong class="money-inline">' + formatBRL(b.plannedCents) + '</strong></div>' +
            '<div><span class="text-aux">Gasto</span><br/><strong class="money-inline">' + formatBRL(b.spentCents) + '</strong></div>' +
            '<div><span class="text-aux">Restante</span><br/><strong class="money-inline">' + formatBRL(b.remainingCents) + '</strong></div>' +
          '</div>' +
          '<p class="text-aux" style="margin-top:10px;">Projeção até o fim do mês: <strong style="color:var(--text-primary);">' + formatBRL(b.projectedEndOfMonthCents) + '</strong></p>' +
          (b.alertMessage ? '<p style="font-size:0.82rem;color:var(--color-warning);font-weight:500;margin-top:6px;">' + b.alertMessage + '</p>' : '') +
        '</div>';
      }).join("");

      return '<div class="card" style="margin-bottom:24px;">' +
        '<h2 class="section-title" style="margin-bottom:12px;">Definir limite de orçamento mensal</h2>' +
        '<form data-form="upsert-budget" style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">' +
          '<div class="form-group" style="margin-bottom:0;flex:1;min-width:200px;"><label>Categoria</label><select id="bud-cat">' + catOptions + '</select></div>' +
          '<div class="form-group" style="margin-bottom:0;width:200px;"><label>Limite planejado (R$)</label><input id="bud-amount" type="number" step="10" min="10" value="500" class="input" required /></div>' +
          '<button type="submit" class="btn btn-primary">Salvar orçamento</button>' +
        '</form>' +
      '</div>' +
      '<div class="grid-2">' + items + '</div>';
    }

    function renderGoals() {
      var items = appState.dashboard.goalProjections.map(function(g) {
        var gChip = g.progressPercentage >= 100
          ? renderChip("positivo")
          : g.onTrack
            ? renderChip("estavel")
            : renderChip("atencao");
        return '<div class="card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<h3 class="section-title">' + g.name + '</h3>' +
            gChip +
          '</div>' +
          '<div class="card-value" style="margin:10px 0;">' + formatBRL(g.currentAmountCents) + ' <span class="text-aux" style="font-weight:500;">de ' + formatBRL(g.targetAmountCents) + ' (' + g.progressPercentage + '%)</span></div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + g.progressPercentage + '%;background:var(--brand-primary);"></div></div>' +
          '<p class="text-aux" style="margin-top:8px;">Faltam: <strong style="color:var(--text-primary);">' + formatBRL(g.remainingAmountCents) + '</strong> • Prazo restante: ' + g.monthsUntilDeadline + ' meses</p>' +
          '<p style="font-size:0.84rem;color:var(--text-secondary);margin:10px 0 14px;padding:12px;background:var(--bg-app);border-radius:10px;">' + g.recommendationMessage + '</p>' +
          '<button type="button" class="btn btn-primary btn-sm" data-action="contribute-goal" data-id="' + g.goalId + '">' + ICONS.plus + '<span>Registrar aporte de R$ 200,00</span></button>' +
        '</div>';
      }).join("");

      return '<div class="card" style="margin-bottom:24px;">' +
        '<h2 class="section-title" style="margin-bottom:12px;">Criar nova meta financeira</h2>' +
        '<form data-form="create-goal" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;align-items:end;">' +
          '<div class="form-group" style="margin-bottom:0;"><label>Nome da meta</label><input id="goal-name" class="input" required placeholder="Ex: Reserva de Viagem" /></div>' +
          '<div class="form-group" style="margin-bottom:0;"><label>Valor alvo (R$)</label><input id="goal-target" type="number" step="50" value="5000" class="input" required /></div>' +
          '<div class="form-group" style="margin-bottom:0;"><label>Aporte mensal (R$)</label><input id="goal-monthly" type="number" step="50" value="400" class="input" required /></div>' +
          '<div class="form-group" style="margin-bottom:0;"><label>Prazo desejado</label><input id="goal-date" type="date" value="2027-08-01" class="input" required /></div>' +
          '<button type="submit" class="btn btn-primary">Criar meta</button>' +
        '</form>' +
      '</div>' +
      '<div class="grid-2">' + items + '</div>';
    }

    function renderDebts() {
      var d = appState.dashboard;
      var av = d.debtSimulations.avalanche;
      var sn = d.debtSimulations.snowball;
      var debtRows = d.debts.map(function(debt) {
        return '<tr>' +
          '<td><strong style="font-weight:600;">' + debt.name + '</strong><br/><span class="text-aux">Credor: ' + debt.creditor + '</span></td>' +
          '<td class="money-inline">' + formatBRL(debt.remainingAmountCents) + '</td>' +
          '<td>' + (debt.monthlyInterestRateBp / 100).toFixed(2).replace(".", ",") + '% a.m.</td>' +
          '<td>' + debt.paidInstallments + '/' + debt.totalInstallments + ' (' + formatBRL(debt.installmentAmountCents) + ')</td>' +
          '<td class="text-aux">' + formatDateBR(debt.nextDueDate) + '</td>' +
          '<td>' + renderChip("pendente", "Em andamento") + '</td>' +
        '</tr>';
      }).join("");

      return '<div class="card" style="margin-bottom:24px;">' +
        '<div class="section-header"><div><h2 class="section-title">Controle de dívidas ativas</h2><p class="text-aux">Acompanhe saldos devedores, taxas de juros e parcelas</p></div></div>' +
        '<div class="table-wrap"><table><thead><tr><th>Dívida / Credor</th><th>Saldo devedor</th><th>Taxa de juros</th><th>Parcelas</th><th>Próx. vencimento</th><th>Status</th></tr></thead><tbody>' + debtRows + '</tbody></table></div>' +
      '</div>' +
      '<div class="grid-2">' +
        '<div class="card card-priority">' +
          '<div class="metric-header"><h3 class="section-title">Estratégia Avalanche (Maior juros primeiro)</h3>' + renderChip("positivo", "Menor custo total") + '</div>' +
          '<p class="text-aux" style="margin:6px 0 12px;">Ordem recomendada: <strong style="color:var(--text-primary);">' + av.orderedDebtNames.join(" → ") + '</strong></p>' +
          '<p style="font-size:0.9rem;">Prazo sem aporte extra: <strong>' + av.baselineMonths + ' meses</strong> (Juros: ' + formatBRL(av.baselineTotalInterestCents) + ')</p>' +
          '<p style="font-size:0.9rem;margin-top:4px;">Com +R$ 300,00 extras/mês: <strong>' + av.acceleratedMonths + ' meses</strong></p>' +
          '<div style="margin-top:14px;padding:12px;background:var(--color-success-bg);color:var(--color-success);border-radius:10px;font-weight:600;font-size:0.88rem;">' +
            'Economia estimada de ' + formatBRL(av.interestSavedCents) + ' em juros e ' + av.monthsSaved + ' meses a menos.' +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="metric-header"><h3 class="section-title">Estratégia Bola de Neve (Menor saldo primeiro)</h3>' + renderChip("estavel", "Vitórias rápidas") + '</div>' +
          '<p class="text-aux" style="margin:6px 0 12px;">Ordem recomendada: <strong style="color:var(--text-primary);">' + sn.orderedDebtNames.join(" → ") + '</strong></p>' +
          '<p style="font-size:0.9rem;">Prazo sem aporte extra: <strong>' + sn.baselineMonths + ' meses</strong> (Juros: ' + formatBRL(sn.baselineTotalInterestCents) + ')</p>' +
          '<p style="font-size:0.9rem;margin-top:4px;">Com +R$ 300,00 extras/mês: <strong>' + sn.acceleratedMonths + ' meses</strong></p>' +
          '<div style="margin-top:14px;padding:12px;background:var(--color-info-bg);color:var(--color-info);border-radius:10px;font-weight:600;font-size:0.88rem;">' +
            'Quita a menor dívida mais cedo para liberar fôlego mensal. Economia: ' + formatBRL(sn.interestSavedCents) + '.' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="text-aux" style="padding:12px 16px;background:var(--bg-surface);border:1px solid var(--border-color);border-radius:12px;">' + av.educationalDisclaimer + '</p>';
    }

    function renderReports() {
      var d = appState.dashboard;
      var fixedSpent = d.expensesByCategory.filter(function(c) { return c.isFixedCost; }).reduce(function(s, c) { return s + c.spentCents; }, 0);
      var varSpent = d.expensesByCategory.filter(function(c) { return !c.isFixedCost; }).reduce(function(s, c) { return s + c.spentCents; }, 0);

      return '<div class="card" style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">' +
        '<div><h2 class="section-title">Relatórios analíticos e exportação</h2><p class="text-aux">Indicadores acessíveis com texto alternativo e sem dependência exclusiva de cor</p></div>' +
        '<div style="display:flex;gap:10px;">' +
          '<a href="/api/v1/transactions/export-csv" class="btn btn-primary btn-sm" download="relatorio-financeiro.csv">' + ICONS.download + '<span>Exportar CSV / Planilha</span></a>' +
          '<button type="button" class="btn btn-sm" data-action="print-report">Exportar PDF</button>' +
        '</div>' +
      '</div>' +
      '<div class="grid-cards">' +
        '<div class="card"><div class="card-title">Taxa de poupança mensal</div><div class="card-value">' + d.savingsRatePercentage + '%</div><div class="metric-footer">' + renderChip("positivo", "Saudável") + '</div></div>' +
        '<div class="card"><div class="card-title">Gastos fixos no mês</div><div class="card-value">' + formatBRL(fixedSpent) + '</div><div class="metric-footer">' + renderChip("estavel", "Previsível") + '</div></div>' +
        '<div class="card"><div class="card-title">Gastos variáveis no mês</div><div class="card-value">' + formatBRL(varSpent) + '</div><div class="metric-footer">' + renderChip("atencao", "Acompanhar") + '</div></div>' +
        '<div class="card"><div class="card-title">Aportes em investimentos</div><div class="card-value">' + formatBRL(d.monthInvestmentsCents) + '</div><div class="metric-footer">' + renderChip("positivo", "Meta mensal") + '</div></div>' +
      '</div>';
    }

    // Área unificada de Configurações agrupando Perfil, Segurança & MFA e Privacidade & LGPD
    function renderSettingsHub() {
      var navPills = '<div class="subnav-pills" role="tablist" aria-label="Seções de Configurações">' +
        '<button type="button" class="subnav-btn" role="tab" aria-selected="' + (settingsSubTab === "profile" ? "true" : "false") + '" data-action="switch-settings-subtab" data-subtab="profile">' + ICONS.user + '<span>Perfil e Onboarding</span></button>' +
        '<button type="button" class="subnav-btn" role="tab" aria-selected="' + (settingsSubTab === "security" ? "true" : "false") + '" data-action="switch-settings-subtab" data-subtab="security">' + ICONS.lock + '<span>Segurança e MFA (2FA)</span></button>' +
        '<button type="button" class="subnav-btn" role="tab" aria-selected="' + (settingsSubTab === "privacy" ? "true" : "false") + '" data-action="switch-settings-subtab" data-subtab="privacy">' + ICONS.shieldCheck + '<span>Privacidade e LGPD</span></button>' +
      '</div>';

      if (settingsSubTab === "security") return navPills + renderSecuritySection();
      if (settingsSubTab === "privacy") return navPills + renderPrivacySection();
      return navPills + renderProfileSection();
    }

    function renderProfileSection() {
      var p = appState.profile;

      return '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="section-header"><div><h2 class="section-title">Perfil financeiro e preferências</h2><p class="text-aux">Seus dados de renda são protegidos com criptografia AES-256-GCM em repouso</p></div></div>' +
          '<form data-form="update-profile">' +
            '<div class="form-grid-2">' +
              '<div class="form-group"><label>Renda mensal estimada (R$)</label><input id="prof-income" type="number" step="100" class="input" value="' + ((p.estimatedMonthlyIncomeCents || 0) / 100) + '" /></div>' +
              '<div class="form-group"><label>Tipo de renda</label><select id="prof-type"><option value="FIXED" ' + (p.incomeType === "FIXED" ? "selected" : "") + '>Fixa</option><option value="VARIABLE" ' + (p.incomeType === "VARIABLE" ? "selected" : "") + '>Variável (Autônomo / Freelancer)</option><option value="MIXED" ' + (p.incomeType === "MIXED" ? "selected" : "") + '>Mista</option></select></div>' +
              '<div class="form-group"><label>Gastos fixos mensais (R$)</label><input id="prof-fixed" type="number" step="50" class="input" value="' + ((p.fixedMonthlyExpensesCents || 0) / 100) + '" /></div>' +
              '<div class="form-group"><label>Modo de controle</label><select id="prof-mode"><option value="INDIVIDUAL" ' + (p.budgetControlMode === "INDIVIDUAL" ? "selected" : "") + '>Individual</option><option value="FAMILY" ' + (p.budgetControlMode === "FAMILY" ? "selected" : "") + '>Familiar / Doméstico</option></select></div>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary" style="margin-top:8px;">Salvar alterações do perfil</button>' +
          '</form>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-header">' +
            '<div><h2 class="section-title">Isolamento de dados e proteção RLS</h2><p class="text-aux">Cada conta possui isolamento estrito por usuário (Row Level Security) e criptografia autenticada</p></div>' +
            renderChip("positivo", "RLS Ativa") +
          '</div>' +
          '<p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:10px;">Suas movimentações, contas, cartões, orçamentos, metas e comprovantes são vinculados exclusivamente ao seu identificador autenticado (<code>auth.uid()</code>).</p>' +
          '<p class="text-aux">Nenhuma chave administrativa ou credencial de servidor é exposta no navegador.</p>' +
        '</div>' +
      '</div>';
    }

    function renderSecuritySection() {
      var sessionsHtml = appState.sessions.map(function(s) {
        return '<tr>' +
          '<td><strong style="font-weight:600;">' + s.deviceName + '</strong><br/><span class="text-aux">' + s.browser + ' • ' + s.os + '</span></td>' +
          '<td>' + s.approximateLocation + '</td>' +
          '<td><code>' + s.ipAddressMasked + '</code></td>' +
          '<td class="text-aux">' + formatDateBR(s.lastActiveAt) + '</td>' +
          '<td>' + renderChip("positivo", "Ativa") + '</td>' +
        '</tr>';
      }).join("");

      return '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="section-header"><div><h2 class="section-title">Autenticação multifator (MFA / 2FA)</h2><p class="text-aux">Compatível com Google Authenticator, Authy e Bitwarden (RFC 6238)</p></div></div>' +
          '<button type="button" class="btn btn-primary" data-action="init-mfa">Configurar chave TOTP 2FA</button>' +
          '<div id="mfa-setup-box" style="margin-top:14px;"></div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-header">' +
            '<div><h2 class="section-title">Dispositivos conectados</h2><p class="text-aux">Controle de sessões ativas</p></div>' +
            '<button type="button" class="btn btn-danger btn-sm" data-action="revoke-sessions">Encerrar todas</button>' +
          '</div>' +
          '<div class="table-wrap"><table><thead><tr><th>Dispositivo</th><th>Local aproximado</th><th>IP mascarado</th><th>Atividade</th><th>Status</th></tr></thead><tbody>' + sessionsHtml + '</tbody></table></div>' +
        '</div>' +
      '</div>';
    }

    function renderPrivacySection() {
      var consentsHtml = appState.consents.map(function(c) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-color);gap:12px;">' +
          '<div><div style="font-weight:600;font-size:0.9rem;">' + c.purposeTitle + '</div><div class="text-aux">Política v' + c.policyVersion + ' • ' + c.purposeCode + '</div></div>' +
          '<button type="button" class="btn btn-sm" data-action="toggle-consent" data-code="' + c.purposeCode + '" data-granted="' + (c.granted ? "true" : "false") + '">' +
            (c.granted ? "Ativo (Revogar)" : "Desativado (Ativar)") +
          '</button>' +
        '</div>';
      }).join("");

      var auditHtml = appState.auditLogs.slice(0, 8).map(function(a) {
        return '<tr><td class="text-aux">' + formatDateBR(a.createdAt) + '</td><td><code>' + a.action + '</code></td><td>' + a.resourceType + '</td><td><code>' + a.ipAddressMasked + '</code></td></tr>';
      }).join("");

      return '<div class="grid-2">' +
        '<div class="card">' +
          '<div class="section-header"><div><h2 class="section-title">Direitos do titular e consentimentos (LGPD)</h2><p class="text-aux">Controle granular, portabilidade e transparência (Lei nº 13.709/2018)</p></div></div>' +
          consentsHtml +
          '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">' +
            '<a href="/api/v1/privacy/export" class="btn btn-primary btn-sm" download="meus-dados-lgpd.json">' + ICONS.download + '<span>Baixar meus dados (JSON)</span></a>' +
          '</div>' +
          '<p class="text-aux" style="margin-top:14px;">Encarregado de Dados (DPO): <strong>privacidade-dpo@meucontrole.ficticio.local</strong></p>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-header"><div><h2 class="section-title">Trilha de auditoria de segurança</h2><p class="text-aux">Registro imutável de eventos sensíveis da conta</p></div></div>' +
          '<div class="table-wrap"><table><thead><tr><th>Data</th><th>Evento</th><th>Recurso</th><th>IP mascarado</th></tr></thead><tbody>' + auditHtml + '</tbody></table></div>' +
        '</div>' +
      '</div>';
    }

    // Delegação global de cliques
    document.addEventListener("click", async function(e) {
      var navBtn = e.target.closest("[data-nav-tab]");
      if (navBtn) {
        e.preventDefault();
        switchTab(navBtn.getAttribute("data-nav-tab"));
        return;
      }

      var actionBtn = e.target.closest("[data-action]");
      if (!actionBtn) return;

      var action = actionBtn.getAttribute("data-action");
      var id = actionBtn.getAttribute("data-id");

      if (action === "toggle-theme") {
        toggleTheme();
      } else if (action === "open-history-modal") {
        isHistoryMaximized = true;
        renderCurrentTab();
      } else if (action === "close-history-modal") {
        isHistoryMaximized = false;
        renderCurrentTab();
      } else if (action === "backdrop-close-modal" && e.target === actionBtn) {
        isHistoryMaximized = false;
        renderCurrentTab();
      } else if (action === "switch-settings-subtab") {
        settingsSubTab = actionBtn.getAttribute("data-subtab") || "profile";
        renderCurrentTab();
      } else if (action === "print-report") {
        window.print();
      } else if (action === "duplicate-tx" && id) {
        await fetch("/api/v1/transactions/" + id + "/duplicate", {
          method: "POST",
          headers: { "X-CSRF-Token": window.__CSRF_TOKEN__ }
        });
        showToast("Movimentação duplicada com sucesso!");
        await refreshState();
      } else if (action === "delete-tx" && id) {
        if (!confirm("Deseja realmente excluir esta movimentação? Você poderá desfazer em seguida.")) return;
        var res = await fetch("/api/v1/transactions/" + id, {
          method: "DELETE",
          headers: { "X-CSRF-Token": window.__CSRF_TOKEN__ }
        });
        if (res.ok) {
          lastDeletedTxId = id;
          var banner = document.getElementById("undo-banner");
          if (banner) {
            banner.style.display = "flex";
            setTimeout(function() { banner.style.display = "none"; }, 10000);
          }
          await refreshState();
        }
      } else if (action === "undo-delete") {
        if (!lastDeletedTxId) return;
        await fetch("/api/v1/transactions/" + lastDeletedTxId + "/undo", {
          method: "POST",
          headers: { "X-CSRF-Token": window.__CSRF_TOKEN__ }
        });
        var bannerEl = document.getElementById("undo-banner");
        if (bannerEl) bannerEl.style.display = "none";
        lastDeletedTxId = null;
        showToast("Exclusão desfeita! Movimentação restaurada.");
        await refreshState();
      } else if (action === "contribute-goal" && id) {
        await fetch("/api/v1/goals/" + id + "/contribute", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({ amountCents: 20000, note: "Aporte rápido pela plataforma" })
        });
        showToast("Aporte de R$ 200,00 registrado na meta!");
        await refreshState();
      } else if (action === "init-mfa") {
        var mfaRes = await fetch("/api/v1/security/mfa-setup", {
          method: "POST",
          headers: { "X-CSRF-Token": window.__CSRF_TOKEN__ }
        });
        if (mfaRes.ok) {
          var data = await mfaRes.json();
          var box = document.getElementById("mfa-setup-box");
          if (box) {
            box.innerHTML = '<div style="padding:14px;background:var(--bg-app);border:1px solid var(--border-color);border-radius:12px;font-size:0.84rem;">' +
              '<p><strong>Segredo Base32 (TOTP):</strong> <code>' + data.secretBase32 + '</code></p>' +
              '<p style="margin-top:6px;"><strong>URI otpauth:</strong> <code style="word-break:break-all;">' + data.otpAuthUri + '</code></p>' +
              '<p style="margin-top:6px;"><strong>Códigos de recuperação de uso único:</strong><br/><code>' + data.backupCodes.join(" • ") + '</code></p>' +
            '</div>';
          }
          showToast("Chave TOTP 2FA gerada com segurança!");
        }
      } else if (action === "revoke-sessions") {
        if (!confirm("Deseja encerrar imediatamente todas as sessões ativas?")) return;
        await fetch("/api/v1/security/revoke-all-sessions", {
          method: "POST",
          headers: { "X-CSRF-Token": window.__CSRF_TOKEN__ }
        });
        showToast("Todas as sessões foram revogadas com sucesso!");
        await refreshState();
      } else if (action === "toggle-consent") {
        var code = actionBtn.getAttribute("data-code");
        var currentlyGranted = actionBtn.getAttribute("data-granted") === "true";
        await fetch("/api/v1/privacy/consents", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({ purposeCode: code, granted: !currentlyGranted })
        });
        showToast("Preferência de consentimento LGPD atualizada!");
        await refreshState();
      }
    });

    // Delegação global de submissão de formulários
    document.addEventListener("submit", async function(e) {
      var form = e.target.closest("[data-form]");
      if (!form) return;
      e.preventDefault();
      var formType = form.getAttribute("data-form");

      if (formType === "create-transaction") {
        var amountReais = parseFloat(document.getElementById("tx-amount").value || "0");
        var payload = {
          description: document.getElementById("tx-desc").value,
          type: document.getElementById("tx-type").value,
          amountCents: Math.round(amountReais * 100),
          categoryId: document.getElementById("tx-cat").value || undefined,
          paymentMethod: document.getElementById("tx-method").value,
          originAccountId: document.getElementById("tx-acc").value,
          installmentTotal: parseInt(document.getElementById("tx-inst").value || "1", 10),
          status: document.getElementById("tx-status").value,
          tags: document.getElementById("tx-tags").value,
          occurrenceDate: "2026-10-26T12:00:00.000Z"
        };
        var res = await fetch("/api/v1/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast("Movimentação registrada com sucesso!");
          await refreshState();
        }
      } else if (formType === "create-account") {
        var accBal = parseFloat(document.getElementById("acc-balance").value || "0");
        await fetch("/api/v1/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({
            name: document.getElementById("acc-name").value,
            type: document.getElementById("acc-type").value,
            initialBalanceCents: Math.round(accBal * 100)
          })
        });
        showToast("Nova conta cadastrada com sucesso!");
        await refreshState();
      } else if (formType === "create-card") {
        var cardLim = parseFloat(document.getElementById("card-limit").value || "0");
        await fetch("/api/v1/credit-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({
            name: document.getElementById("card-name").value,
            totalLimitCents: Math.round(cardLim * 100),
            closingDay: parseInt(document.getElementById("card-close").value || "20", 10),
            dueDay: parseInt(document.getElementById("card-due").value || "28", 10)
          })
        });
        showToast("Novo cartão de crédito cadastrado!");
        await refreshState();
      } else if (formType === "upsert-budget") {
        var budVal = parseFloat(document.getElementById("bud-amount").value || "0");
        await fetch("/api/v1/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({
            categoryId: document.getElementById("bud-cat").value,
            referenceMonth: "2026-10",
            plannedAmountCents: Math.round(budVal * 100)
          })
        });
        showToast("Orçamento mensal salvo!");
        await refreshState();
      } else if (formType === "create-goal") {
        var gTarget = parseFloat(document.getElementById("goal-target").value || "0");
        var gMonthly = parseFloat(document.getElementById("goal-monthly").value || "0");
        await fetch("/api/v1/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({
            name: document.getElementById("goal-name").value,
            targetAmountCents: Math.round(gTarget * 100),
            recurringContributionCents: Math.round(gMonthly * 100),
            targetDate: new Date(document.getElementById("goal-date").value).toISOString()
          })
        });
        showToast("Nova meta financeira criada!");
        await refreshState();
      } else if (formType === "update-profile") {
        var incVal = parseFloat(document.getElementById("prof-income").value || "0");
        var fixVal = parseFloat(document.getElementById("prof-fixed").value || "0");
        await fetch("/api/v1/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": window.__CSRF_TOKEN__ },
          body: JSON.stringify({
            estimatedMonthlyIncomeCents: Math.round(incVal * 100),
            incomeType: document.getElementById("prof-type").value,
            fixedMonthlyExpensesCents: Math.round(fixVal * 100),
            budgetControlMode: document.getElementById("prof-mode").value
          })
        });
        showToast("Perfil financeiro atualizado com sucesso!");
        await refreshState();
      }
    });

    // Delegação global de inputs
    document.addEventListener("input", async function(e) {
      var inputType = e.target.getAttribute("data-input");
      if (inputType === "smart-desc") {
        var desc = e.target.value;
        var hint = document.getElementById("smart-cat-hint");
        if (!hint) return;
        if (!desc || desc.length < 3) { hint.textContent = ""; return; }
        var res = await fetch("/api/v1/classify?description=" + encodeURIComponent(desc));
        if (res.ok) {
          var data = await res.json();
          hint.textContent = "Sugestão automática: categoria " + data.categoryName + " (" + (data.reason === "USER_LEARNED_PREFERENCE" ? "Aprendido de preferência sua" : "Reconhecido pela descrição") + ")";
        }
      } else if (inputType === "filter-tx-search") {
        txSearchFilter = e.target.value;
        renderCurrentTab();
      } else if (inputType === "filter-tx-status") {
        txStatusFilter = e.target.value;
        renderCurrentTab();
      }
    });

    // Tecla ESC fecha a janela modal sobreposta do histórico
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && isHistoryMaximized) {
        isHistoryMaximized = false;
        renderCurrentTab();
      }
    });
  </script>
</body>
</html>`;
}
