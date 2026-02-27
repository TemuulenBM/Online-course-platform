import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Backend-аас ирсэн relative path-г бүрэн URL болгох.
 * Жнь: "/uploads/avatars/abc.png" → "http://localhost:3001/uploads/avatars/abc.png"
 */
const API_ORIGIN = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  try {
    return new URL(base).origin;
  } catch {
    return 'http://localhost:3001';
  }
})();

export function getFileUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_ORIGIN}${path}`;
}

/** Мөнгөн дүнг MNT форматаар харуулах: 24500000 → "₮24,500,000" */
export function formatMNT(amount: number): string {
  return `₮${amount.toLocaleString('en-US')}`;
}

/** Секундийг цаг/минут форматаар харуулах: 51600 → "14ц 20м" */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}м`;
  if (minutes === 0) return `${hours}ц`;
  return `${hours}ц ${minutes}м`;
}

/** Тоог locale-тэй форматлах: 1284 → "1,284" */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** Өгөгдлийг CSV файл болгож татах */
export function exportToCsv(
  data: Record<string, unknown>[],
  filename: string,
  headers?: { key: string; label: string }[],
) {
  if (!data.length) return;
  const keys = headers ? headers.map((h) => h.key) : Object.keys(data[0]!);
  const headerRow = headers ? headers.map((h) => h.label).join(',') : keys.join(',');
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const val = row[key];
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(','),
  );
  const csv = [headerRow, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
