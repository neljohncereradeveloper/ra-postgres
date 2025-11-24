/**
 * Format a date string into a more readable format
 * @param dateString - Date string in ISO format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string into a more detailed format including day of week
 * @param dateString - Date string in ISO format
 * @returns Formatted date string (e.g., "Monday, January 1, 2023")
 */
export function formatDateLong(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time string into a more readable format
 * @param timeString - Time string in ISO or HH:mm format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export function formatTime(timeString: string | null): string {
  if (!timeString) return "-";
  // Try to parse as ISO or HH:mm
  const date = new Date(`1970-01-01T${timeString}`);
  if (isNaN(date.getTime())) return timeString;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
