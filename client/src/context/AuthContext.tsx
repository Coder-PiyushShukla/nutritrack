import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAccessToken } from '../services/api';
import { identifyUser } from '../services/socket';
import { UserRole } from '../types';

const BACKEND_URL = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : '') || 'http://localhost:5000';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isOnboarded?: boolean;
  goal?: string;
  weight?: number;
  targetWeight?: number;
  dietPreference?: string;
  dailyCalories?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: UserRole; message?: string }>;
  signup: (name: string, email: string, pass: string, role: UserRole) => Promise<{ success: boolean; role: UserRole }>;
  updateProfile: (data: Partial<AuthUser>) => void;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
}

export const AUTHORIZED_DEMO_ACCOUNTS: Record<string, { name: string; role: UserRole; password: string; avatar: string }> = {
  'aarav.mehta@studio.com': {
    name: 'Aarav Mehta',
    role: 'dieter',
    password: 'NutriTrack@2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  'maya.lin@clinical.org': {
    name: 'Dr. Maya Lin, RD',
    role: 'nutritionist',
    password: 'NutriTrack@2026',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  'sophia.aris@lead.net': {
    name: 'Sophia Aris',
    role: 'admin',
    password: 'NutriTrack@2026',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('nutritrack_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nutritrack_auth_user', JSON.stringify(user));
      try {
        identifyUser({ userId: user.id, role: user.role, name: user.name });
      } catch (e) {
        // safe
      }
    } else {
      localStorage.removeItem('nutritrack_auth_user');
      setAccessToken(null);
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; role: UserRole; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Attempt authenticating against backend REST API
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: pass }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const u = data.data.user;
        const normalizedRole: UserRole =
          u.role?.toLowerCase() === 'admin'
            ? 'admin'
            : u.role?.toLowerCase() === 'nutritionist'
            ? 'nutritionist'
            : 'dieter';

        const authUser: AuthUser = {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: normalizedRole,
          isOnboarded: true,
        };

        if (data.data.accessToken) {
          setAccessToken(data.data.accessToken);
        }

        setUser(authUser);
        return { success: true, role: normalizedRole };
      } else if (response.status === 401 || response.status === 400 || response.status === 403) {
        throw new Error(data.message || 'Invalid email or password');
      }
    } catch (apiErr: any) {
      if (apiErr.message === 'Invalid email or password' || apiErr.message?.includes('password') || apiErr.message?.includes('credentials')) {
        throw apiErr;
      }
    }

    // 2. Check in dynamic registered users from sign-up
    const registeredUsers = JSON.parse(localStorage.getItem('nutritrack_registered_users') || '{}');
    if (registeredUsers[cleanEmail]) {
      const regUser = registeredUsers[cleanEmail];
      if (regUser.password !== pass) {
        throw new Error('Invalid password! Access denied. Check your password and try again.');
      }
      const authUser: AuthUser = {
        id: regUser.id,
        name: regUser.name,
        email: cleanEmail,
        role: regUser.role,
        isOnboarded: regUser.isOnboarded ?? true,
        goal: regUser.goal,
        dietPreference: regUser.dietPreference,
        dailyCalories: regUser.dailyCalories,
      };
      setUser(authUser);
      return { success: true, role: regUser.role };
    }

    // 3. Verified demo credentials check
    const matched = AUTHORIZED_DEMO_ACCOUNTS[cleanEmail];
    if (!matched) {
      throw new Error(`Unregistered account: "${cleanEmail}". Please check your email or click "Create Account".`);
    }

    if (pass !== matched.password) {
      throw new Error('Invalid password! Access denied. Check your password and try again.');
    }

    const fallbackUser: AuthUser = {
      id: `usr-${matched.role}-${Date.now()}`,
      name: matched.name,
      email: cleanEmail,
      role: matched.role,
      avatar: matched.avatar,
      isOnboarded: true,
    };

    setUser(fallbackUser);
    return { success: true, role: matched.role };
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<{ success: boolean; role: UserRole }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter a valid full name (minimum 2 characters).');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please provide a valid email address.');
    }
    if (!pass || pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Try backend REST API registration
    try {
      await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: pass,
          role: role.toUpperCase(),
        }),
      });
    } catch (e) {
      // Local fallback
    }

    // Save locally
    const registeredUsers = JSON.parse(localStorage.getItem('nutritrack_registered_users') || '{}');
    if (registeredUsers[cleanEmail] || AUTHORIZED_DEMO_ACCOUNTS[cleanEmail]) {
      throw new Error(`An account with email "${cleanEmail}" already exists. Please sign in.`);
    }

    const newUserRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      email: cleanEmail,
      password: pass,
      role,
      isOnboarded: false,
    };

    registeredUsers[cleanEmail] = newUserRecord;
    localStorage.setItem('nutritrack_registered_users', JSON.stringify(registeredUsers));

    const authUser: AuthUser = {
      id: newUserRecord.id,
      name: cleanName,
      email: cleanEmail,
      role,
      isOnboarded: false,
    };

    setUser(authUser);
    return { success: true, role };
  };

  const updateProfile = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };

      // Update in registered users store as well
      const registeredUsers = JSON.parse(localStorage.getItem('nutritrack_registered_users') || '{}');
      if (registeredUsers[updated.email]) {
        registeredUsers[updated.email] = {
          ...registeredUsers[updated.email],
          ...data,
        };
        localStorage.setItem('nutritrack_registered_users', JSON.stringify(registeredUsers));
      }

      return updated;
    });
  };

  const demoLogin = (role: UserRole) => {
    let email = 'aarav.mehta@studio.com';
    if (role === 'nutritionist') email = 'maya.lin@clinical.org';
    if (role === 'admin') email = 'sophia.aris@lead.net';

    const account = AUTHORIZED_DEMO_ACCOUNTS[email];
    if (account) {
      const demoUser: AuthUser = {
        id: `usr-${role}-demo`,
        name: account.name,
        email,
        role,
        avatar: account.avatar,
        isOnboarded: true,
      };
      setUser(demoUser);
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('nutritrack_auth_user');
    try {
      fetch(`${BACKEND_URL}/api/v1/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (e) {
      // safe
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        updateProfile,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
