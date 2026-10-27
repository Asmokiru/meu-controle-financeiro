/**
 * Formata valor em centavos para Real brasileiro (ex: 123456 -> "R$ 1.234,56").
 */
export function formatBRLFromCents(cents: number | bigint): string {
  const numeric = Number(cents) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numeric);
}

/**
 * Converte string ou número em reais para centavos inteiros.
 */
export function parseBRLToCents(input: string | number): number {
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
export function formatDateBR(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata porcentagem para exibição visual no padrão brasileiro com vírgula decimal (ex: 23.9 -> "23,9%").
 */
export function formatPercentBR(value: number): string {
  const num = Number(value) || 0;
  const rounded = Math.round(num * 10) / 10;
  return `${String(rounded).replace('.', ',')}%`;
}

/**
 * Pluralização dinâmica de meses em português ("1 mês" no singular e "X meses" no plural).
 */
export function formatMonths(n: number): string {
  const count = Math.max(0, Math.round(Number(n) || 0));
  return count === 1 ? '1 mês' : `${count} meses`;
}
