import { API_ENDPOINTS, apiService } from '@/services/apiService';
import { User, LoginResponse, SignUpRequest, SignUpResponse, RawRole, UserType } from '../../types';
// import { apiService, API_ENDPOINTS } from 

const SESSION_STORAGE_KEY = 'hexaorder.session';
const TOKEN_KEY = 'auth_token';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

interface Session {
  user: User;
  expiresAt: string;
}

/**
 * Map backend role string to frontend UserRole ('ADMIN' | 'USER')
 */
export function mapRole(rawRole: string): 'ADMIN' | 'USER' {
  const adminRoles = ['ADMIN', 'ADMIN_TYPE1', 'ADMIN_TYPE2'];
  return adminRoles.includes(rawRole) ? 'ADMIN' : 'USER';
}

/**
 * Map backend LoginResponse to frontend User shape
 */
export function mapLoginResponseToUser(json: LoginResponse): User {
  return {
    id: json.username,           // will be replaced by /me call
    name: json.username,         // will be replaced by /me call
    email: json.username,
    role: mapRole(json.role),
    rawRole: json.role as RawRole,
    userType: json.userType as UserType,
    avatarUrl: '',
    avatar: '',
    token: json.token,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

const parseSession = (rawValue: string | null): User | null => {
  if (!rawValue) return null;
  try {
    const session: Session = JSON.parse(rawValue);
    const expiresAt = Date.parse(session.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session.user;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const authService = {
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    return parseSession(localStorage.getItem(SESSION_STORAGE_KEY));
  },

  storeUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    const session: Session = {
      user,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    if (user.token) {
      localStorage.setItem(TOKEN_KEY, user.token);
    }
  },

  storeToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  clearSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Real login — POST /api/auth/login
   */
  login: async (email: string, password: string): Promise<User> => {
    const json = await apiService.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
      username: email,   // backend field is "username"
      password,
    });

    if (!json.token) {
      throw new Error(json.message || 'Login failed');
    }

    // Store token immediately so subsequent calls work
    authService.storeToken(json.token);

    const user = mapLoginResponseToUser(json);
    return user;
  },

  /**
   * Fetch full profile from GET /api/auth/me
   * Falls back gracefully if endpoint not yet implemented on backend
   */
  fetchMe: async (): Promise<Partial<User>> => {
    try {
      const json = await apiService.get<any>(API_ENDPOINTS.ME);
      return {
        id: String(json.id || json.email),
        name: `${json.fname || ''} ${json.lname || ''}`.trim() || json.email,
        phoneNumber: json.phoneNumber,
        profilePicture: json.profilePicture,
        avatarUrl: json.profilePicture || '',
        avatar: json.profilePicture || '',
      };
    } catch {
      // /me not yet implemented — return empty so app still works
      return {};
    }
  },

  /**
   * Sign up — POST /api/auth/signup
   */
  signup: async (data: SignUpRequest): Promise<SignUpResponse> => {
    return apiService.post<SignUpResponse>(API_ENDPOINTS.SIGNUP, data);
  },

  /**
   * Send phone OTP
   */
  sendPhoneOtp: async (phone: string): Promise<{ message: string }> => {
    return apiService.postQuery(API_ENDPOINTS.PHONE_SEND_OTP, { phone });
  },

  /**
   * Verify phone OTP and login
   */
  verifyPhoneOtp: async (phone: string, otp: string): Promise<User> => {
    const json = await apiService.postQuery<LoginResponse & { email: string }>(
      API_ENDPOINTS.PHONE_VERIFY_OTP,
      { phone, otp }
    );
    authService.storeToken(json.token);
    return mapLoginResponseToUser(json);
  },

  hasActiveSession: (): boolean => {
    return authService.getStoredUser() !== null;
  },
};