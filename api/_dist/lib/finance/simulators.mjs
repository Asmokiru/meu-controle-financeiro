import {
  formatBRLFromCents,
  formatMonths,
  formatPercentBR,
} from './formatters.mjs';

                              
            
              
              
               
               

                                 
                     
                       
                           
                       
                     
                         
                         
                                   
                               
                              
 

/**
 * Calcula o status completo de um orçamento mensal com alertas em 50%, 80%, 100% e acima do limite.
 */
export function analyzeMonthlyBudget(params   
                     
                       
                           
                       
                     
                             
                       
 )                 {
  const day = Math.max(1, params.currentDayOfMonth || 15);
  const totalDays = Math.max(28, params.daysInMonth || 30);

  const planned = Math.max(1, params.plannedCents);
  const spent = Math.max(0, params.spentCents);
  const remaining = params.plannedCents - spent;
  const pct = Math.round((spent / planned) * 1000) / 10;
  const dailyRate = spent / day;
  const projected = Math.round(dailyRate * totalDays);

  let alertLevel                   = 'NORMAL';
  let alertMessage                = null;

  if (pct > 100) {
    alertLevel = 'EXCEEDED';
    alertMessage = `Você ultrapassou o orçamento de ${params.categoryName} em ${formatBRLFromCents(Math.abs(remaining))} (${formatPercentBR(pct)} utilizado).`;
  } else if (pct === 100) {
    alertLevel = 'ALERT_100';
    alertMessage = `Você atingiu 100% do limite planejado para ${params.categoryName}.`;
  } else if (pct >= 80) {
    alertLevel = 'ALERT_80';
    alertMessage = `Atenção: você já utilizou ${formatPercentBR(pct)} do orçamento definido para ${params.categoryName}.`;
  } else if (pct >= 50) {
    alertLevel = 'ALERT_50';
    alertMessage = `Você chegou à metade (${formatPercentBR(pct)}) do orçamento mensal de ${params.categoryName}.`;
  }

  return {
    categoryId: params.categoryId,
    categoryName: params.categoryName,
    subcategoryName: params.subcategoryName,
    plannedCents: params.plannedCents,
    spentCents: spent,
    remainingCents: remaining,
    percentageUsed: pct,
    projectedEndOfMonthCents: projected,
    alertLevel,
    alertMessage,
  };
}

                                 
                 
               
                            
                             
                               
                             
                              
                                              
                   
                                           
                                   
                                
 

/**
 * Calcula projeção de conclusão de meta financeira e sugere ajustes quando o ritmo atual for insuficiente.
 */
export function calculateGoalProjection(params   
                 
               
                            
                             
                                     
                            
                       
 )                 {
  const now = params.referenceDate || new Date();
  const target = new Date(params.targetDate);
  const diffMs = target.getTime() - now.getTime();
  const monthsUntilDeadline = Math.max(
    1,
    Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30.44))
  );

  const remaining = Math.max(0, params.targetAmountCents - params.currentAmountCents);
  const progressPercentage =
    params.targetAmountCents > 0
      ? Math.min(
          100,
          Math.round((params.currentAmountCents / params.targetAmountCents) * 1000) / 10
        )
      : 100;

  const requiredMonthly = Math.ceil(remaining / monthsUntilDeadline);
  const projectedMonths =
    remaining === 0
      ? 0
      : params.recurringContributionCents > 0
        ? Math.ceil(remaining / params.recurringContributionCents)
        : null;

  const onTrack =
    remaining === 0 ||
    (projectedMonths !== null && projectedMonths <= monthsUntilDeadline);

  const suggestedAdjustmentCents = Math.max(
    0,
    requiredMonthly - params.recurringContributionCents
  );

  let recommendationMessage = '';
  if (remaining === 0) {
    recommendationMessage = `Parabéns! Você já concluiu sua meta "${params.name}".`;
  } else if (
    params.recurringContributionCents > 0 &&
    remaining <= params.recurringContributionCents
  ) {
    recommendationMessage = `Excelente ritmo! Mantendo ${formatBRLFromCents(params.recurringContributionCents)}/mês, você concluirá esta meta já no próximo aporte (1 mês).`;
  } else if (onTrack) {
    recommendationMessage = `Excelente ritmo! Mantendo ${formatBRLFromCents(params.recurringContributionCents)}/mês, você concluirá "${params.name}" em cerca de ${formatMonths(projectedMonths || 1)}, dentro do prazo.`;
  } else {
    recommendationMessage = `No ritmo atual (${formatBRLFromCents(params.recurringContributionCents)}/mês), a meta levaria ${projectedMonths !== null ? formatMonths(projectedMonths) : 'muitos meses'}. Sugerimos aumentar o aporte em ${formatBRLFromCents(suggestedAdjustmentCents)}/mês (total de ${formatBRLFromCents(requiredMonthly)}/mês) para atingir o objetivo no prazo.`;
  }

  return {
    goalId: params.goalId,
    name: params.name,
    targetAmountCents: params.targetAmountCents,
    currentAmountCents: params.currentAmountCents,
    remainingAmountCents: remaining,
    progressPercentage,
    monthsUntilDeadline,
    projectedMonthsAtCurrentPace: projectedMonths,
    onTrack,
    requiredMonthlyContributionCents: requiredMonthly,
    suggestedAdjustmentCents,
    recommendationMessage,
  };
}

                                
             
               
                   
                               
                                                        
                                 
 

                                       
                                     
                             
                         
                                     
                            
                                        
                      
                             
                                   
                                
 

/**
 * Simula quitação de dívidas usando as estratégias Avalanche (maior taxa de juros primeiro)
 * ou Bola de Neve / Snowball (menor saldo devedor primeiro), comparando com pagamentos extras.
 */
export function simulateDebtPayoff(
  debts                 ,
  strategy                          ,
  extraMonthlyPaymentCents = 0
)                       {
  const disclaimer =
    'Aviso educacional: Estas simulações são estimativas matemáticas para planejamento pessoal e não constituem aconselhamento financeiro, jurídico ou oferta de renegociação bancária.';

  const activeDebts = debts.filter((d) => d.remainingAmountCents > 0);
  if (activeDebts.length === 0) {
    return {
      strategy,
      orderedDebtNames: [],
      baselineMonths: 0,
      baselineTotalInterestCents: 0,
      acceleratedMonths: 0,
      acceleratedTotalInterestCents: 0,
      monthsSaved: 0,
      interestSavedCents: 0,
      extraMonthlyPaymentCents,
      educationalDisclaimer: disclaimer,
    };
  }

  const sorted = [...activeDebts].sort((a, b) => {
    if (strategy === 'AVALANCHE') {
      return b.monthlyInterestRateBp - a.monthlyInterestRateBp;
    }
    return a.remainingAmountCents - b.remainingAmountCents;
  });

  function runSimulation(extraCents        )   
                   
                               
    {
    const balances = sorted.map((d) => ({
      balance: d.remainingAmountCents,
      rate: d.monthlyInterestRateBp / 10_000,
      minPayment: Math.max(
        d.installmentAmountCents,
        Math.ceil(d.remainingAmountCents * (d.monthlyInterestRateBp / 10_000) + 1000)
      ),
    }));

    let months = 0;
    let totalInterest = 0;
    const MAX_MONTHS = 360;

    while (balances.some((b) => b.balance > 0) && months < MAX_MONTHS) {
      months++;
      let availableExtra = extraCents;

      // Aplica juros do mês e pagamento mínimo
      for (const item of balances) {
        if (item.balance <= 0) {
          availableExtra += item.minPayment; // Efeito cascata: parcela liberada soma ao pagamento da próxima
          continue;
        }
        const interest = Math.round(item.balance * item.rate);
        totalInterest += interest;
        item.balance += interest;

        const payment = Math.min(item.balance, item.minPayment);
        item.balance -= payment;
        if (payment < item.minPayment) {
          availableExtra += item.minPayment - payment;
        }
      }

      // Direciona todo o valor extra para a dívida prioritária da estratégia
      for (const item of balances) {
        if (item.balance > 0 && availableExtra > 0) {
          const extraApplied = Math.min(item.balance, availableExtra);
          item.balance -= extraApplied;
          availableExtra -= extraApplied;
        }
      }
    }

    return { months, totalInterestCents: totalInterest };
  }

  const baseline = runSimulation(0);
  const accelerated = runSimulation(Math.max(0, extraMonthlyPaymentCents));

  return {
    strategy,
    orderedDebtNames: sorted.map((d) => d.name),
    baselineMonths: baseline.months,
    baselineTotalInterestCents: baseline.totalInterestCents,
    acceleratedMonths: accelerated.months,
    acceleratedTotalInterestCents: accelerated.totalInterestCents,
    monthsSaved: Math.max(0, baseline.months - accelerated.months),
    interestSavedCents: Math.max(
      0,
      baseline.totalInterestCents - accelerated.totalInterestCents
    ),
    extraMonthlyPaymentCents,
    educationalDisclaimer: disclaimer,
  };
}
