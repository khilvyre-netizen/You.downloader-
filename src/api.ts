// API configuration for both co-located full-stack servers and static hosting (e.g. GitHub Pages)

export function getApiBaseUrl(): string {
  // Check build-time environment variable
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // Check user-configured custom backend URL (stored in localStorage)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('omnirip_custom_api_url');
    if (stored && stored.trim()) {
      return stored.trim().replace(/\/$/, '');
    }
  }

  // Default to relative root (works when served by Express or reverse proxy)
  return '';
}

export function setCustomApiUrl(url: string | null): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('omnirip_custom_api_url', url.trim().replace(/\/$/, ''));
    } else {
      localStorage.removeItem('omnirip_custom_api_url');
    }
  }
}

export function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return (
    host.endsWith('github.io') ||
    host.endsWith('pages.dev') ||
    host.endsWith('netlify.app') ||
    host.endsWith('vercel.app')
  );
}

export async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${path}`;

  try {
    const res = await fetch(fullUrl, options);
    return res;
  } catch (err: any) {
    if (isStaticHost() && !getApiBaseUrl()) {
      throw new Error(
        'Cannot connect to backend server. Note: GitHub Pages is a static host and cannot run Node.js/yt-dlp. Please set your backend API URL in Settings.'
      );
    }
    throw new Error(`Network error connecting to ${fullUrl}: ${err.message || 'Server unreachable'}`);
  }
}

export async function parseApiResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (isStaticHost() && !getApiBaseUrl()) {
      throw new Error(
        'Backend server is not configured. GitHub Pages only hosts static files. Deploy server.ts to Render, Railway, or VPS, and enter its URL in Settings.'
      );
    }
    if (res.status === 404) {
      throw new Error('API endpoint not found (404). Please ensure the backend server is running.');
    }
    throw new Error(`Server returned unexpected response (status ${res.status}).`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}
