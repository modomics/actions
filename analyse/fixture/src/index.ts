export function calculateTotal(
  items: Array<{ price: number; quantity: number }>,
): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function formatCurrency(
  amount: number,
  currency: string = "GBP",
): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(
    amount,
  );
}
