const INTEGER_FORMATTER = new Intl.NumberFormat('en-GB', {
  maximumFractionDigits: 0,
});

export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return INTEGER_FORMATTER.format(Math.round(value));
}
