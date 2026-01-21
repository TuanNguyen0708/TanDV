/**
 * Format date theo local timezone (không bị ảnh hưởng bởi UTC)
 * @param date - Date object cần format
 * @returns String ở format YYYY-MM-DD
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Lấy ngày hiện tại ở local timezone
 * @returns String ở format YYYY-MM-DD
 */
export function getTodayLocalDate(): string {
  return formatLocalDate(new Date());
}
