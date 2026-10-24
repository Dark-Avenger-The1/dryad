const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Turns a database time (UTC ISO string, e.g. "2026-10-07T03:15:00Z") into the
// user's local calendar date, e.g. "Oct 7, 2026". Returns null when missing.
export function formatDate(isoString) {
  if (!isoString) return null;

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
