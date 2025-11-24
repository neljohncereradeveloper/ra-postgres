/**
 * Utility functions for formatting time values
 */

/**
 * Formats a time string (HH:MM:SS or HH:MM) into a readable format
 * @param time - Time string in format HH:MM:SS or HH:MM
 * @param use12Hour - Whether to use 12-hour format with AM/PM
 * @returns Formatted time string
 */
export function formatTime(
  time: string | null | undefined,
  use12Hour = true
): string {
  if (!time) return "N/A";

  // Handle different time formats
  const timeRegex = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
  const match = time.match(timeRegex);

  if (!match) return time; // Return the original if it doesn't match expected format

  let hours = parseInt(match[1], 10);
  const minutes = match[2];

  if (use12Hour) {
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours}:${minutes} ${period}`;
  } else {
    // Ensure 2-digit hours for 24-hour format
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${minutes}`;
  }
}

/**
 * Formats a time range from start and end times
 * @param startTime - Start time string
 * @param endTime - End time string
 * @param use12Hour - Whether to use 12-hour format with AM/PM
 * @returns Formatted time range
 */
export function formatTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
  use12Hour = true
): string {
  if (!startTime || !endTime) {
    return formatTime(startTime || endTime, use12Hour) || "N/A";
  }

  return `${formatTime(startTime, use12Hour)} - ${formatTime(
    endTime,
    use12Hour
  )}`;
}

/**
 * Formats an ISO timestamp string to a readable time format
 * @param isoTimestamp - ISO timestamp string (e.g., "2025-04-15T05:13:47.000Z")
 * @param use12Hour - Whether to use 12-hour format with AM/PM
 * @returns Formatted time string
 */
export function formatISOTime(
  isoTimestamp: string | null | undefined,
  use12Hour = true
): string {
  if (!isoTimestamp) return "N/A";

  try {
    const date = new Date(isoTimestamp);
    const phTime = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    );
    console.log("phtime : ", phTime);
    if (isNaN(phTime.getTime())) return isoTimestamp; // Return original if invalid date

    const hours = phTime.getHours();
    const minutes = phTime.getMinutes().toString().padStart(2, "0");

    if (use12Hour) {
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      return `${displayHours}:${minutes} ${period}`;
    } else {
      const formattedHours = hours.toString().padStart(2, "0");
      return `${formattedHours}:${minutes}`;
    }
  } catch (error) {
    console.error("Error formatting ISO timestamp:", error);
    return isoTimestamp;
  }
}
