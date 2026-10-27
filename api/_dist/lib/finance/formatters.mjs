/**
 * Formata valor em centavos para Real brasileiro (ex: 123456 -> "R$ 1.234,56").
 */
export function formatBRLFromCents(cents                 )         {
  const numeric = Number(cents) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numeric);
}

/**
 * Converte string ou número em reais para centavos inteiros.
 */
export function parseBRLToCents(input                 )         {
  if (typeof input === 'number') {
    return Math.round(input * 100);
  }
  const clean = input
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = Number.parseFloat(clean);
  if (Number.isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Formata data ISO ou objeto Date para o padrão brasileiro dd/mm/aaaa.
 */
export function formatDateBR(dateInput               )         {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
