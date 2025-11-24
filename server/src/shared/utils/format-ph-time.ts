/**
 * Get the date in Philippine timezone as a string in YYYY-MM-DD format.
 * @param date Optional date to format. If not provided, current date will be used.
 * @returns Date string in 'YYYY-MM-DD' format in Asia/Manila timezone.
 */
export function getPHDateString(date?: Date): string {
  const phDate = date ? new Date(date) : new Date();
  const phTime = new Date(
    phDate.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
  );
  return (
    phTime.getFullYear() +
    '-' +
    String(phTime.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(phTime.getDate()).padStart(2, '0')
  );
}

/**
 * Get only the date in Philippine timezone as a Date object
 * @param date Optional date to format. If not provided, current date will be used
 * @returns Date object in Philippine timezone with time set to 00:00:00
 */
export function getPHDateTime(date?: Date): Date {
  const phDate = date ? new Date(date) : new Date();
  const phTime = new Date(
    phDate.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
  );

  return phTime;
}
