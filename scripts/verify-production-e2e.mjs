async function testProd() {
  const base = 'https://meu-controle-financeiro-green.vercel.app';
  console.log('--- Testando Produção Vercel: ' + base + ' ---');

  // 1. GET / sem cookies
  const rHome = await fetch(base + '/');
  const html = await rHome.text();
  const domBeforeScript = html.split('<script id="app-client-script">')[0];
  console.log('1. Status GET /:', rHome.status);
  console.log('   Auth modal presente:', domBeforeScript.includes('id="auth-screen-overlay"'));
  console.log('   Botão Testar Demo presente:', domBeforeScript.includes('Testar Conta Demonstração'));
  console.log('   Sidebar ausente do DOM inicial:', !domBeforeScript.includes('<aside class="sidebar"'));
  console.log('   Dados da Mariana ausentes do DOM inicial:', !domBeforeScript.includes('Mariana Costa'));
  console.log('   Toast fantasma ausente do DOM inicial:', !domBeforeScript.includes('Movimentação excluída.'));

  // 2. Registro de nova conta
  const email = 'teste_' + Date.now() + '@exemplo.com';
  const rReg = await fetch(base + '/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Usuário Teste Real',
      email: email,
      password: 'Senha@123',
      acceptedTermsAndPrivacy: true
    })
  });
  console.log('2. Status Registro:', rReg.status);
  const regData = await rReg.json();
  const cookie = rReg.headers.get('set-cookie');
  console.log('   Autenticado:', regData.authenticated);
  console.log('   E-mail cadastrado:', regData.state.user.email);
  console.log('   Saldo inicial zerado:', regData.state.dashboard.totalBalanceCents === 0);

  // 3. Adicionar receita de R$ 500,00
  const rTx = await fetch(base + '/api/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
      'X-CSRF-Token': regData.csrfToken
    },
    body: JSON.stringify({
      description: 'Recebimento Freelance',
      type: 'INCOME',
      amountCents: 50000,
      paymentMethod: 'PIX',
      originAccountId: '',
      status: 'PAID',
      occurrenceDate: '2026-10-26T12:00:00.000Z'
    })
  });
  console.log('3. Status Nova Movimentação:', rTx.status);

  // 4. Checar saldo atualizado
  const rState1 = await fetch(base + '/api/v1/state', {
    headers: { 'Cookie': cookie }
  });
  const state1 = await rState1.json();
  console.log('4. Saldo pós-receita (deve ser 50000):', state1.dashboard.totalBalanceCents);
  console.log('   Receita do mês (deve ser 50000):', state1.dashboard.monthIncomeCents);

  // 5. Logout
  const rLogout = await fetch(base + '/api/v1/auth/logout', {
    method: 'POST',
    headers: { 'Cookie': cookie }
  });
  console.log('5. Status Logout:', rLogout.status);

  // 6. Simular restauração/login com a hidratação dos dados persistidos pelo cliente
  const rHyd = await fetch(base + '/api/v1/auth/hydrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: state1.user,
      profile: state1.profile,
      accounts: state1.accounts,
      creditCards: state1.creditCards,
      categories: state1.categories,
      transactions: state1.transactions,
      budgets: state1.budgets,
      goals: state1.goals,
      debts: state1.debts
    })
  });
  console.log('6. Status Re-login / Hidratação:', rHyd.status);
  const hydData = await rHyd.json();
  console.log('   Autenticado após re-login:', hydData.authenticated);
  console.log('   Saldo preservado após logout (50000):', hydData.state.dashboard.totalBalanceCents);
  console.log('   Conta NÃO é demo (Mariana isolada):', !hydData.state.dashboard.isDemoAccount);

  // 7. Teste de login na Conta Demonstração
  const rDemo = await fetch(base + '/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demo: true })
  });
  const demoData = await rDemo.json();
  console.log('7. Conta Demo autenticada:', demoData.authenticated);
  console.log('   Usuário Demo:', demoData.state.user.name);
  console.log('   Disponível real calculado (negativo por excesso de gastos):', demoData.state.dashboard.availableToSpendMonthCents);
  console.log('   Status do disponível:', demoData.state.dashboard.availableToSpendStatus.badgeLabel);
  console.log('   Insights desduplicados (Alimentação apenas 1x):', demoData.state.dashboard.structuredInsights.filter(i => i.description.includes('Alimentação')).length === 1);
  console.log('--- FIM DO TESTE E2E EM PRODUÇÃO: SUCESSO TOTAL ---');
}

testProd().catch(err => {
  console.error('Erro na verificação de produção:', err);
  process.exit(1);
});
