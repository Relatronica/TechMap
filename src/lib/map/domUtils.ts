/** DOM / fetch helpers for the map client. */

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sanitizeUrl(url: unknown): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export async function fetchJson(url: string, { optional = false }: { optional?: boolean } = {}) {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    if (optional) {
      console.warn(err.message);
      return null;
    }
    throw err;
  }
  return res.json();
}

export function showMapLoadError(message: string) {
  const host = document.getElementById('map') || document.body;
  let banner = document.getElementById('map-load-error');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'map-load-error';
    banner.className = 'map-load-error';
    banner.setAttribute('role', 'alert');
    host.appendChild(banner);
  }
  banner.textContent = message;
}
