export function hxpRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return '';
  }
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (days >= 1) {
    return days === 1 ? 'a day ago' : `${days} days ago`;
  }
  if (hours >= 1) {
    return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  }
  return minutes <= 1 ? 'just now' : `${minutes} minutes ago`;
}
