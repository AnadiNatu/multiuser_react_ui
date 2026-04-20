import { User } from '../../types';
import { MOCK_USERS } from '../../services/mockData';

const SESSION_STORAGE_KEY = 'hexaorder.session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

interface Session {
  user: User;
  expiresAt: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parseSession = (rawValue: string | null): User | null => {
  if (!rawValue) return null;

  try {
    const session: Session = JSON.parse(rawValue);
    const expiresAt = Date.parse(session.expiresAt);

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session.user;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
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
  },

  clearSession: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    await delay(800);
    
    const user = MOCK_USERS.find(u => u.email === email);
    if (user && password === 'password') {
      return user;
    }
    
    throw new Error('Invalid credentials');
  },

  hasActiveSession: (): boolean => {
    return authService.getStoredUser() !== null;
  },
};