/**
 * Platform-Aware Token Storage Service (SSO v2)
 * 
 * WEB:
 * - Access token: IN-MEMORY ONLY (never localStorage — XSS protection)
 * - Refresh token: HTTP-only cookie (server-managed)
 * - Multi-tab sync via BroadcastChannel
 * - Session restored on page load via cookie-based /v2/auth/refresh
 * 
 * MOBILE (Capacitor):
 * - All tokens: Capacitor Preferences (native secure storage)
 * - Refresh token stored locally (no cookie support in WebView)
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// ============= PLATFORM DETECTION =============

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): 'web' | 'android' | 'ios' => {
  if (!Capacitor.isNativePlatform()) return 'web';
  const platform = Capacitor.getPlatform();
  return platform === 'ios' ? 'ios' : 'android';
};

// ============= STORAGE KEYS =============

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token', // Mobile always; Web only when rememberMe
  USER_DATA: 'user_data',
  DEVICE_ID: 'device_id',
  TOKEN_EXPIRY: 'token_expiry',
  REMEMBER_ME: 'remember_me',
} as const;

// ============= IN-MEMORY TOKEN STORE =============

let memoryStore: {
  accessToken: string | null;
  refreshToken: string | null; // mobile only
  expiresAt: number | null;
} = { accessToken: null, refreshToken: null, expiresAt: null };

// ============= MULTI-TAB SYNC (Web Only) =============

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (isNativePlatform()) return null;
  if (!broadcastChannel && typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('auth_sync');
    broadcastChannel.onmessage = (event) => {
      const { type, accessToken, expiresAt } = event.data;
      if (type === 'TOKEN_UPDATE') {
        memoryStore.accessToken = accessToken;
        memoryStore.expiresAt = expiresAt;
      } else if (type === 'LOGOUT') {
        memoryStore = { accessToken: null, refreshToken: null, expiresAt: null };
        // Dispatch event so AuthContext can react
        window.dispatchEvent(new CustomEvent('auth:logged-out-other-tab'));
      }
    };
  }
  return broadcastChannel;
}

// Initialize broadcast channel on web
if (typeof window !== 'undefined' && !isNativePlatform()) {
  getBroadcastChannel();
}

function broadcastTokenUpdate() {
  const ch = getBroadcastChannel();
  if (ch) {
    ch.postMessage({
      type: 'TOKEN_UPDATE',
      accessToken: memoryStore.accessToken,
      expiresAt: memoryStore.expiresAt,
    });
  }
}

function broadcastLogout() {
  const ch = getBroadcastChannel();
  if (ch) {
    ch.postMessage({ type: 'LOGOUT' });
  }
}

// ============= TOKEN STORAGE SERVICE =============

export const tokenStorageService = {
  // ============= ACCESS TOKEN =============

  /**
   * Store access token
   * - Web: IN-MEMORY ONLY (+ broadcast to other tabs)
   * - Mobile: Capacitor Preferences + memory
   */
  async setAccessToken(token: string): Promise<void> {
    memoryStore.accessToken = token;

    if (isNativePlatform()) {
      await Preferences.set({ key: KEYS.ACCESS_TOKEN, value: token });
    }

    // Broadcast to other tabs (web only)
    broadcastTokenUpdate();
  },

  /**
   * Get access token from memory.
   * Returns null if expired or not present.
   */
  async getAccessToken(): Promise<string | null> {
    // Check expiry
    if (memoryStore.expiresAt && Date.now() >= memoryStore.expiresAt) {
      // Token expired in memory
      return null;
    }

    if (memoryStore.accessToken) {
      return memoryStore.accessToken;
    }

    // On mobile, fall back to Preferences if memory is empty (cold start)
    if (isNativePlatform()) {
      const result = await Preferences.get({ key: KEYS.ACCESS_TOKEN });
      if (result.value) {
        memoryStore.accessToken = result.value;
        // Also load expiry
        if (!memoryStore.expiresAt) {
          memoryStore.expiresAt = await this.getTokenExpiry();
        }
        // Re-check expiry
        if (memoryStore.expiresAt && Date.now() >= memoryStore.expiresAt) {
          return null;
        }
        return result.value;
      }
    }

    // Web: no fallback — memory-only. If null, caller should refresh via cookie.
    return null;
  },

  async removeAccessToken(): Promise<void> {
    memoryStore.accessToken = null;
    if (isNativePlatform()) {
      await Preferences.remove({ key: KEYS.ACCESS_TOKEN });
    }
  },

  // ============= REFRESH TOKEN =============

  async setRefreshToken(token: string): Promise<void> {
    memoryStore.refreshToken = token;
    if (isNativePlatform()) {
      await Preferences.set({ key: KEYS.REFRESH_TOKEN, value: token });
    } else {
      // Web: also store if rememberMe is enabled (fallback for httpOnly cookie)
      const rememberMe = localStorage.getItem(KEYS.REMEMBER_ME);
      if (rememberMe === 'true') {
        localStorage.setItem(KEYS.REFRESH_TOKEN, token);
      }
    }
  },

  async getRefreshToken(): Promise<string | null> {
    if (memoryStore.refreshToken) return memoryStore.refreshToken;
    if (isNativePlatform()) {
      const result = await Preferences.get({ key: KEYS.REFRESH_TOKEN });
      memoryStore.refreshToken = result.value;
      return result.value;
    }
    // Web: check localStorage fallback (rememberMe sessions)
    const stored = localStorage.getItem(KEYS.REFRESH_TOKEN);
    if (stored) {
      memoryStore.refreshToken = stored;
      return stored;
    }
    return null;
  },

  async removeRefreshToken(): Promise<void> {
    memoryStore.refreshToken = null;
    if (isNativePlatform()) {
      await Preferences.remove({ key: KEYS.REFRESH_TOKEN });
    } else {
      localStorage.removeItem(KEYS.REFRESH_TOKEN);
    }
  },

  // ============= USER DATA =============

  async setUserData(userData: object): Promise<void> {
    const dataString = JSON.stringify(userData);
    if (isNativePlatform()) {
      await Preferences.set({ key: KEYS.USER_DATA, value: dataString });
    } else {
      localStorage.setItem(KEYS.USER_DATA, dataString);
    }
  },

  async getUserData<T = any>(): Promise<T | null> {
    let dataString: string | null = null;
    if (isNativePlatform()) {
      const result = await Preferences.get({ key: KEYS.USER_DATA });
      dataString = result.value;
    } else {
      dataString = localStorage.getItem(KEYS.USER_DATA);
    }
    if (!dataString) return null;
    try {
      return JSON.parse(dataString) as T;
    } catch {
      return null;
    }
  },

  async removeUserData(): Promise<void> {
    if (isNativePlatform()) {
      await Preferences.remove({ key: KEYS.USER_DATA });
    } else {
      localStorage.removeItem(KEYS.USER_DATA);
    }
  },

  // ============= TOKEN EXPIRY =============

  async setTokenExpiry(expiryTimestamp: number): Promise<void> {
    memoryStore.expiresAt = expiryTimestamp;
    const value = expiryTimestamp.toString();
    if (isNativePlatform()) {
      await Preferences.set({ key: KEYS.TOKEN_EXPIRY, value });
    }
    // Web: expiry lives only in memory (alongside access token)
    broadcastTokenUpdate();
  },

  async getTokenExpiry(): Promise<number | null> {
    if (memoryStore.expiresAt) return memoryStore.expiresAt;
    if (isNativePlatform()) {
      const result = await Preferences.get({ key: KEYS.TOKEN_EXPIRY });
      if (result.value) {
        memoryStore.expiresAt = parseInt(result.value, 10);
        return memoryStore.expiresAt;
      }
    }
    return null;
  },

  async isTokenExpired(): Promise<boolean> {
    const expiry = await this.getTokenExpiry();
    if (!expiry) return true;
    return Date.now() >= expiry;
  },

  // ============= DEVICE ID (Mobile Only) =============

  async getDeviceId(): Promise<string | null> {
    if (!isNativePlatform()) return null;
    const result = await Preferences.get({ key: KEYS.DEVICE_ID });
    if (result.value) return result.value;
    const deviceId = `${getPlatform()}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    await Preferences.set({ key: KEYS.DEVICE_ID, value: deviceId });
    return deviceId;
  },

  // ============= REMEMBER ME =============

  async setRememberMe(value: boolean): Promise<void> {
    if (isNativePlatform()) {
      await Preferences.set({ key: KEYS.REMEMBER_ME, value: value.toString() });
    } else {
      localStorage.setItem(KEYS.REMEMBER_ME, value.toString());
    }
  },

  async getRememberMe(): Promise<boolean> {
    if (isNativePlatform()) {
      const result = await Preferences.get({ key: KEYS.REMEMBER_ME });
      return result.value === 'true';
    }
    return localStorage.getItem(KEYS.REMEMBER_ME) === 'true';
  },

  // ============= CLEAR ALL =============

  async clearAll(): Promise<void> {
    // Clear memory
    memoryStore = { accessToken: null, refreshToken: null, expiresAt: null };

    if (isNativePlatform()) {
      await Promise.all([
        Preferences.remove({ key: KEYS.ACCESS_TOKEN }),
        Preferences.remove({ key: KEYS.REFRESH_TOKEN }),
        Preferences.remove({ key: KEYS.USER_DATA }),
        Preferences.remove({ key: KEYS.TOKEN_EXPIRY }),
        Preferences.remove({ key: KEYS.REMEMBER_ME }),
      ]);
    } else {
      // Web: clear all auth data from localStorage
      localStorage.removeItem(KEYS.USER_DATA);
      localStorage.removeItem(KEYS.REFRESH_TOKEN);
      localStorage.removeItem(KEYS.REMEMBER_ME);
      // Also clear legacy keys
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('org_access_token');
      localStorage.removeItem(KEYS.ACCESS_TOKEN);
      localStorage.removeItem(KEYS.TOKEN_EXPIRY);
    }

    // Notify other tabs
    broadcastLogout();
  },

  // ============= AUTH CHECK =============

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  },

  /**
   * Check if we have ANY auth state (token in memory or user data cached).
   * Used to decide whether to attempt a cookie-based refresh on app init.
   */
  hasAnyAuthHint(): boolean {
    // If we have a token in memory, yes
    if (memoryStore.accessToken) return true;
    // On web, check if user_data exists (implies previous session)
    if (!isNativePlatform()) {
      return !!localStorage.getItem(KEYS.USER_DATA);
    }
    return false;
  },

  // ============= SYNC ACCESS TOKEN (for API headers) =============

  getAccessTokenSync(): string | null {
    if (isNativePlatform()) {
      return memoryStore.accessToken || null;
    }
    // Web: memory-only
    return memoryStore.accessToken || null;
  },
};

// ============= AUTH API HELPER =============

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = await tokenStorageService.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const getAuthHeadersSync = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = tokenStorageService.getAccessTokenSync();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export default tokenStorageService;
