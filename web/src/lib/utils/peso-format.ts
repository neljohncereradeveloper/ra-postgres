/**
 * Formats a number as Philippine Peso currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted peso string (e.g., "₱1,234.56")
 */
export function formatPeso(
  amount: number,
  options: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
): string {
  return new Intl.NumberFormat("en-PH", options).format(amount);
}
