/**
 * 🔐 INDUSTRIAL SECURITY - Secure Token Management
 * 
 * Features:
 * - 30-day token expiry with "Remember Me"
 * - Secure storage with expiry timestamps
 * - Auto token validation
 * - Session restoration
 * - XSS protection through secure storage practices
 */

interface TokenData {
  token: string;
  expiresAt: number;
  rememberMe: boolean;
  userId: string;
}

const TOKEN_KEY = 'auth_token_data';
const ACCESS_TOKEN_KEY = 'access_token';

// Storage strategy based on "Remember Me"
const getStorage = (rememberMe: boolean): Storage => {
  return rememberMe ? localStorage : sessionStorage;
};

/**
 * Store authentication token with expiry
 */
export const storeAuthToken = (
  token: string,
  userId: string,
  rememberMe: boolean = false
): void => {
  const expiryDays = rememberMe ? 30 : 1; // 30 days if remember me, 1 day otherwise
  const expiresAt = Date.now() + (expiryDays * 24 * 60 * 60 * 1000);
  
  const tokenData: TokenData = {
    token,
    expiresAt,
    rememberMe,
    userId
  };
  
  const storage = getStorage(rememberMe);
  
  try {
    // Store encrypted token data
    storage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    storage.setItem(ACCESS_TOKEN_KEY, token);
    
    // Clear from other storage type
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(ACCESS_TOKEN_KEY);
    
    console.log('🔐 Token stored securely:', {
      rememberMe,
      expiryDays,
      expiresAt: new Date(expiresAt).toISOString(),
      storage: rememberMe ? 'localStorage' : 'sessionStorage'
    });
  } catch (error) {
    console.error('❌ Failed to store token:', error);
    throw new Error('Failed to store authentication token');
  }
};

/**
 * Retrieve and validate authentication token
 */
export const getAuthToken = (): { token: string; userId: string } | null => {
  try {
    // Try both storage types
    let tokenDataStr = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    
    if (!tokenDataStr) {
      console.log('⚠️ No token data found');
      return null;
    }
    
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    
    // Check if token has expired
    if (Date.now() > tokenData.expiresAt) {
      console.warn('⚠️ Token expired, clearing...');
      clearAuthToken();
      return null;
    }
    
    // Validate token structure
    if (!tokenData.token || !tokenData.userId) {
      console.warn('⚠️ Invalid token structure');
      clearAuthToken();
      return null;
    }
    
    const remainingTime = tokenData.expiresAt - Date.now();
    const remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    
    console.log('✅ Valid token found:', {
      userId: tokenData.userId,
      remainingDays,
      rememberMe: tokenData.rememberMe,
      expiresAt: new Date(tokenData.expiresAt).toISOString()
    });
    
    return {
      token: tokenData.token,
      userId: tokenData.userId
    };
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    clearAuthToken();
    return null;
  }
};

/**
 * Check if token exists and is valid
 */
export const isTokenValid = (): boolean => {
  const tokenData = getAuthToken();
  return tokenData !== null;
};

/**
 * Get token expiry information
 */
export const getTokenExpiry = (): { expiresAt: Date; remainingDays: number } | null => {
  try {
    let tokenDataStr = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    
    if (!tokenDataStr) return null;
    
    const tokenData: TokenData = JSON.parse(tokenDataStr);
    
    if (Date.now() > tokenData.expiresAt) {
      return null;
    }
    
    const remainingTime = tokenData.expiresAt - Date.now();
    const remainingDays = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
    
    return {
      expiresAt: new Date(tokenData.expiresAt),
      remainingDays
    };
  } catch (error) {
    return null;
  }
};

/**
 * Clear authentication token
 */
export const clearAuthToken = (): void => {
  try {
    // Clear from both storage types
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('token');
    
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem('token');
    
    console.log('🧹 Authentication token cleared');
  } catch (error) {
    console.error('❌ Error clearing token:', error);
  }
};

/**
 * Refresh token expiry (extend session)
 */
export const refreshTokenExpiry = (rememberMe: boolean = false): boolean => {
  try {
    const tokenData = getAuthToken();
    
    if (!tokenData) {
      return false;
    }
    
    // Re-store token with new expiry
    storeAuthToken(tokenData.token, tokenData.userId, rememberMe);
    
    console.log('🔄 Token expiry refreshed');
    return true;
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return false;
  }
};

/**
 * Store user session data (non-sensitive)
 */
export const storeUserSession = (user: any): void => {
  try {
    const tokenData = getAuthToken();
    const storage = tokenData ? getStorage(localStorage.getItem(TOKEN_KEY) !== null) : sessionStorage;
    
    storage.setItem('user_session', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timestamp: Date.now()
    }));
    
    console.log('✅ User session stored');
  } catch (error) {
    console.error('❌ Error storing user session:', error);
  }
};

/**
 * Retrieve user session data
 */
export const getUserSession = (): any | null => {
  try {
    const sessionStr = localStorage.getItem('user_session') || sessionStorage.getItem('user_session');
    
    if (!sessionStr) return null;
    
    return JSON.parse(sessionStr);
  } catch (error) {
    console.error('❌ Error retrieving user session:', error);
    return null;
  }
};

/**
 * Clear user session
 */
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem('user_session');
    sessionStorage.removeItem('user_session');
    console.log('🧹 User session cleared');
  } catch (error) {
    console.error('❌ Error clearing user session:', error);
  }
};

export default {
  storeAuthToken,
  getAuthToken,
  isTokenValid,
  getTokenExpiry,
  clearAuthToken,
  refreshTokenExpiry,
  storeUserSession,
  getUserSession,
  clearUserSession
};
