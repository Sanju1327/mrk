import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, LoginPayload, RegisterPayload } from '@/types/auth';
import { authApi } from '@/lib/auth-api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isTeacher: boolean;
  isAdmin: boolean; // Alias for isSuperAdmin for backwards compatibility
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  );
  // If token exists, initialize in loading state so route guards do not redirect prematurely
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  // Persist auth state to localStorage
  const persistAuth = useCallback((accessToken: string, userData: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Verify token on mount by calling /api/auth/me
  useEffect(() => {
    const verifyToken = async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        // Token expired or invalid
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(payload);
        persistAuth(response.accessToken, response.user);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      setIsLoading(true);
      try {
        const response = await authApi.register(payload);
        persistAuth(response.accessToken, response.user);
      } finally {
        setIsLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const isAuthenticated = !!token && !!user;
  // Exactly three roles: STUDENT, TEACHER, SUPER_ADMIN
  const isSuperAdmin = user?.roles?.includes('ROLE_SUPER_ADMIN') ?? false;
  const isTeacher = isSuperAdmin || (user?.roles?.includes('ROLE_TEACHER') ?? false);
  const isAdmin = isSuperAdmin; // Compatibility alias

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      isSuperAdmin,
      isTeacher,
      isAdmin,
      login,
      register,
      logout,
    }),
    [user, token, isAuthenticated, isLoading, isSuperAdmin, isTeacher, isAdmin, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
