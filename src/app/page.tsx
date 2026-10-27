import React from 'react';
import { defaultStore } from '../lib/store/database.ts';
import { seedDemoData } from '../lib/seed-data.ts';
import { formatBRLFromCents } from '../lib/finance/formatters.ts';

export default function HomePage() {
  const { demoUserId } = seedDemoData(defaultStore);
  const summary = defaultStore.getDashboardSummary(demoUserId, '2026-10');

  return (
    <main style={{ padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Meu Controle Financeiro — Painel Principal</h1>
        <p>
          Ambiente de Demonstração ([EXEMPLO / DEMO]) • Protegido por Argon2id,
          AES-256-GCM, MFA TOTP e LGPD
        </p>
      </header>
      <section
        aria-label="Resumo Financeiro"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <h2>Saldo Total Consolidado</h2>
          <p>{formatBRLFromCents(summary.totalBalanceCents)}</p>
        </div>
        <div>
          <h2>Receitas do Mês</h2>
          <p>{formatBRLFromCents(summary.monthIncomeCents)}</p>
        </div>
        <div>
          <h2>Despesas do Mês</h2>
          <p>{formatBRLFromCents(summary.monthExpenseCents)}</p>
        </div>
        <div>
          <h2>Disponível no Mês</h2>
          <p>{formatBRLFromCents(summary.availableToSpendMonthCents)}</p>
        </div>
      </section>
    </main>
  );
}
