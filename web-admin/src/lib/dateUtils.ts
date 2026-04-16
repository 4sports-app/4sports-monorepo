import { format, parseISO, isValid } from 'date-fns';

function toDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  return parseISO(date);
}

export function formatDate(date?: string | Date): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!isValid(d)) return '-';
  return format(d, 'dd/MM/yyyy');
}

export function formatDateTime(date?: string | Date): string {
  if (!date) return '-';
  const d = toDate(date);
  if (!isValid(d)) return '-';
  return format(d, 'dd/MM/yyyy HH:mm');
}
