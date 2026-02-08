import { calculateTotal, formatCurrency } from "./index";

export function generateInvoiceSummary(
  items: Array<{ price: number; quantity: number }>,
): string {
  const total = calculateTotal(items);
  return `Total: ${formatCurrency(total)}`;
}
