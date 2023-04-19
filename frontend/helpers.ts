// /////////////////////////////////////////////////////////////////////////////
// HELPERS
// /////////////////////////////////////////////////////////////////////////////

// 👍 https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript
export function toISOString(date: Date): string {
  const pad = (num): string => `${num < 10 ? '0' : ''}${num}`;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 🔥 for testing only!
export function sleep(ms): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
