export function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}
