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
