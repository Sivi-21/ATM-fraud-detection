import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'admin' | 'operator' | 'security';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  username: string;
  action: string;
  details: string;
  ipAddress: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; deliveryMethod?: 'sms' | 'email'; demoOtp?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; message?: string }>;
  resend2FA: () => Promise<{ success: boolean; message?: string; demoOtp?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, details: string) => void;
  sessionTimeRemaining: number;
  resetSessionTimer: () => void;
  pending2FA: { tempToken: string; user: { username: string; email: string } } | null;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Role permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_dashboard', 'control_atm', 'view_archive', 'view_models', 'view_config', 'manage_users', 'view_audit_logs', 'export_reports'],
  operator: ['view_dashboard', 'control_atm', 'view_archive', 'export_reports'],
  security: ['view_dashboard', 'view_archive', 'dispatch_security'],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending2FA, setPending2FA] = useState<{ user: { username: string; email: string }; tempToken: string } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(SESSION_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('atm-guard-user');
    const savedLogs = localStorage.getItem('atm-guard-audit-logs');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedLogs) {
      setAuditLogs(JSON.parse(savedLogs));
    }
    setIsLoading(false);
  }, []);

  // Session timeout timer
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
      setSessionTimeRemaining(remaining);

      if (remaining === 0) {
        logout();
        alert('Session expired due to inactivity. Please log in again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, lastActivity]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      setLastActivity(Date.now());
      setSessionTimeRemaining(SESSION_TIMEOUT);
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; deliveryMethod?: 'sms' | 'email'; demoOtp?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store temp token for 2FA verification
        setPending2FA({ 
          tempToken: data.tempToken,
          user: { username: data.username, email: data.email }
        });
        return { 
          success: true, 
          message: data.message,
          deliveryMethod: data.deliveryMethod,
          demoOtp: data.demoOtp
        };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const verify2FA = async (code: string): Promise<{ success: boolean; message?: string }> => {
    if (!pending2FA) {
      return { success: false, message: 'Session expired. Please login again.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tempToken: pending2FA.tempToken, 
          code 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newUser: User = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
        };
        setUser(newUser);
        localStorage.setItem('atm-guard-user', JSON.stringify(newUser));
        localStorage.setItem('atm-guard-token', data.token); // JWT token
        setPending2FA(null);
        addAuditLog('LOGIN', `User ${newUser.username} logged in successfully`);
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid verification code' };
    } catch (error) {
      console.error('2FA verification error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const resend2FA = async (): Promise<{ success: boolean; message?: string; demoOtp?: string }> => {
    if (!pending2FA) {
      return { success: false, message: 'Session expired. Please login again.' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: pending2FA.tempToken }),
      });

      const data = await response.json();
      return { 
        success: response.ok && data.success,
        message: data.message,
        demoOtp: data.demoOtp
      };
    } catch (error) {
      console.error('Resend 2FA error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = useCallback(async () => {
    if (user) {
      // Notify backend of logout
      try {
        const token = localStorage.getItem('atm-guard-token');
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
      addAuditLog('LOGOUT', `User ${user.username} logged out`);
    }
    setUser(null);
    setPending2FA(null);
    localStorage.removeItem('atm-guard-user');
    localStorage.removeItem('atm-guard-token');
    setSessionTimeRemaining(SESSION_TIMEOUT);
  }, [user]);

  // Helper function for authenticated API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('atm-guard-token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  // Fetch audit logs from backend
  const fetchAuditLogs = async () => {
    try {
      const response = await apiCall('/audit-logs');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs);
        localStorage.setItem('atm-guard-audit-logs', JSON.stringify(data.logs));
      }
    } catch (error) {
      console.error('Fetch audit logs error:', error);
    }
  };

  // Sync audit log to backend
  const syncAuditLog = async (entry: AuditLogEntry) => {
    try {
      await apiCall('/audit-logs', {
        method: 'POST',
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Sync audit log error:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
  };

  const addAuditLog = (action: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      userId: user?.id || 'anonymous',
      username: user?.username || 'anonymous',
      action,
      details,
      ipAddress: '127.0.0.1', // Mock IP - in real app, get from backend
    };
    setAuditLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 1000); // Keep last 1000 entries
      localStorage.setItem('atm-guard-audit-logs', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSessionTimer = () => {
    setLastActivity(Date.now());
    setSessionTimeRemaining(SESSION_TIMEOUT);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      verify2FA,
      resend2FA,
      logout,
      hasPermission,
      auditLogs,
      addAuditLog,
      sessionTimeRemaining,
      resetSessionTimer,
      pending2FA,
      apiCall,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
