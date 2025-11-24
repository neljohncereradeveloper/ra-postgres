# Date Format Errors: Local vs ISO (Asia/Manila)

## Background

When working with dates in JavaScript/TypeScript, it's important to understand the difference between **local time** and **ISO (UTC) time**. This is especially critical for applications that need to compare dates or display them in a specific timezone, such as Asia/Manila (Philippines).

## Common Issues

### 1. Date Mismatch Due to Timezone

- **Problem:**
  Using `new Date().toISOString().split('T')[0]` returns the date in UTC, which may be different from the local date in the Philippines, especially if your server is not in the same timezone.
- **Example:**
  If it's `2024-06-10 01:00` in Manila (UTC+8), `toISOString()` may return `2024-06-09T17:00:00.000Z`, resulting in a date of `2024-06-09`.

### 2. Incorrect Date Comparisons

- **Problem:**
  Comparing a date string in local format (e.g., `06/10/2024`) with an ISO string (`2024-06-10`) will always fail, even if they represent the same day.
- **Solution:**
  Always convert dates to the same format and timezone before comparing.

## Best Practices

- **Always use a consistent date format for comparisons.**
  Prefer the ISO format (`YYYY-MM-DD`) for string comparisons.
- **Convert all dates to the target timezone (e.g., Asia/Manila) before formatting or comparing.**
- **Use utility functions** (like `getPHDateString`) to ensure dates are always in the correct timezone and format.

## Example Utility

```ts
/**
 * Get the date in Philippine timezone as a string in YYYY-MM-DD format.
 * @param date Optional date to format. If not provided, current date will be used.
 * @returns Date string in 'YYYY-MM-DD' format in Asia/Manila timezone.
 */
export function getPHDateString(date?: Date): string {
  const phDate = date ? new Date(date) : new Date();
  const phTime = new Date(
    phDate.toLocaleString("en-US", { timeZone: "Asia/Manila" })
  );
  return (
    phTime.getFullYear() +
    "-" +
    String(phTime.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(phTime.getDate()).padStart(2, "0")
  );
}
```

## Error Message Example

> **Cannot start. Event is not scheduled for today.**  
> This error may occur if the event date and the current date are compared in different formats or timezones. Ensure both dates are formatted as `YYYY-MM-DD` in the Asia/Manila timezone before comparison.

---

**Summary:**

- Use ISO format (`YYYY-MM-DD`) for all date comparisons.
- Always convert to the correct timezone (Asia/Manila) before formatting.
- Avoid mixing local and ISO formats in your codebase.
