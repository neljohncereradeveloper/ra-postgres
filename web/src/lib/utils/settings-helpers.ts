/**
 * Helper to get Tailwind classes for event status badge
 * @param status The event status string
 * @returns Tailwind classes for styling the badge
 */
export const getStatusBadgeClasses = (status: string | undefined): string => {
  if (!status) return "bg-gray-100 text-gray-800";
  switch (status.toLowerCase()) {
    case "started":
      return "bg-green-100 text-green-800";
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-purple-100 text-purple-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Removes the decimal part of a number, returning only the whole number.
 * @param value number to truncate
 * @returns whole number part
 */
export function removeDecimal(value: number): number {
  return Math.trunc(value);
}
