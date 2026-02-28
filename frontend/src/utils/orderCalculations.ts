/**
 * Calculate the total cost of an order.
 * @param pricePer1000 - Price per 1000 units (in smallest currency unit)
 * @param quantity - Number of units ordered
 * @returns Total cost
 */
export function calculateOrderTotal(pricePer1000: bigint, quantity: number): number {
  return (Number(pricePer1000) * quantity) / 1000;
}

/**
 * Format a numeric value as currency (INR).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a bigint balance value (stored as paise/smallest unit) to display.
 */
export function formatBalance(amount: bigint): string {
  return formatCurrency(Number(amount) / 100);
}
