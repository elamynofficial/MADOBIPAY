import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { secure } from '@/src/lib/storage';

function lanHost() {
  const pinned = process.env.EXPO_PUBLIC_LAN_IP?.trim();
  if (pinned) return pinned.replace(/^https?:\/\//, '').split(':')[0];
  const uri =
    Constants.expoConfig?.hostUri ??
    (Constants as { linkingUri?: string }).linkingUri ??
    '';
  const host = uri.replace(/^(exp|http|https):\/\//, '').split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('.exp.direct')) return host;
  return '';
}

/** On a phone, 127.0.0.1 is the phone itself. Use the PC Wi-Fi IP so Expo Go can hit the API. */
export function apiBase() {
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL?.trim() || 'http://127.0.0.1:4000/v1';
  }
  const host = lanHost();
  if (host) return `http://${host}:4000/v1`;
  const env = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (env && !/localhost|127\.0\.0\.1/.test(env)) return env;
  return 'http://localhost:4000/v1';
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, method: Method, body?: unknown, retry = true): Promise<T> {
  const token = await secure.getAccess();
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Device-Id': 'mobile-app',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    const refresh = await secure.getRefresh();
    if (refresh) {
      const refreshed = await fetch(`${apiBase()}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (refreshed.ok) {
        const data = (await refreshed.json()) as { accessToken?: string };
        if (data.accessToken) {
          await secure.setAccess(data.accessToken);
          return request<T>(path, method, body, false);
        }
      }
    }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiError(res.status, err.message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export async function api<T>(path: string, method: Method = 'GET', body?: unknown): Promise<T> {
  return request<T>(path, method, body);
}

export const useLiveApi = process.env.EXPO_PUBLIC_USE_LIVE_API === 'true';
