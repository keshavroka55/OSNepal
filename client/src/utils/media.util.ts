import { API_BASE_URL } from '../features/api/api';

export function resolveMediaUrl(url?: string | null | any): string {
  if (!url) return '';

  try {
    const maybe: any = url as any;
    if (typeof maybe === 'object') {
      const candidate =
        maybe.logoUrl ||
        maybe.imageUrl ||
        maybe.url ||
        maybe.path ||
        maybe.filename ||
        maybe.file ||
        maybe.src;
      if (candidate && typeof candidate === 'string') {
        if (/^https?:\/\//i.test(candidate)) return candidate;
        return `${API_BASE_URL}${candidate.startsWith('/') ? candidate : `/${candidate}`}`;
      }
      return '';
    }
  } catch (e) {
    // ignore and fallback to string coercion
  }

  const str = String(url).trim();
  if (!str || str === 'null' || str === 'undefined') return '';
  if (/^https?:\/\//i.test(str)) return str;
  return `${API_BASE_URL}${str.startsWith('/') ? str : `/${str}`}`;
}
