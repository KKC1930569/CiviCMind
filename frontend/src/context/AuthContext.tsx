import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';
import type { LoginPayload, RegisterPayload, AuthorityRegisterPayload } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  registerAuthority: (payload: AuthorityRegisterPayload) => Promise<void>;
  logout: () => void;
  isAuthority: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('civicmind_user') || localStorage.getItem('urbaneye_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('civicmind_token') || localStorage.getItem('urbaneye_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('civicmind_user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('[CivicMind] Auth verification failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    const data = await authApi.login(payload);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('civicmind_token', data.access_token);
    localStorage.setItem('civicmind_user', JSON.stringify(data.user));
  };

  const register = async (payload: RegisterPayload) => {
    await authApi.register(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const registerAuthority = async (payload: AuthorityRegisterPayload) => {
    await authApi.registerAuthority(payload);
    await login({ email: payload.email, password: payload.password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('civicmind_token');
    localStorage.removeItem('civicmind_user');
    localStorage.removeItem('urbaneye_token');
    localStorage.removeItem('urbaneye_user');
  };

  const isAuthority = user?.role === 'AUTHORITY' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        registerAuthority,
        logout,
        isAuthority,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
