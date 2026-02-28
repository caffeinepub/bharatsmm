/**
 * Calculate the total cost of an order.
 * @param pricePer1000 - Price per 1000 units (as a float/number)
 * @param quantity - Number of units ordered
 * @returns Total cost in INR (integer, rounded down)
 */
export function calculateOrderTotal(pricePer1000: number, quantity: number): number {
  return Math.floor((quantity * pricePer1000) / 1000);
}

/**
 * Format a number as INR currency string.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a bigint balance (stored as integer rupees) for display.
 */
export function formatBalance(balance: bigint): string {
  return `₹${balance.toString()}`;
}
