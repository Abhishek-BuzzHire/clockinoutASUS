"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// --- 1. Define Types ---

export interface UserState {
  id: string;
  username: string;
  role: string;
}

interface TokenPayload {
  id: string | number;
  username: string;
  role: string;
  exp?: number;
  iat?: number;
  jti?: string;
  token_type?: string;
}

interface AuthContextValue {
  user: UserState | null;
  loading: boolean;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Helper: Synchronously decode token to user state (runs during useState init)
function getUserFromCookie(): UserState | null {
  if (typeof window === "undefined") return null; // SSR safety
  try {
    const accessToken = Cookies.get("access");
    if (!accessToken) return null;
    const decoded = jwtDecode<TokenPayload>(accessToken);
    if (!decoded.id || !decoded.username || !decoded.role) return null;
    return {
      id: String(decoded.id),
      username: decoded.username,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user synchronously from cookie — no flash of "Loading user session..."
  const [user, setUser] = useState<UserState | null>(() => getUserFromCookie());
  const [loading, setLoading] = useState(() => {
    // If we already have a user from cookie, no need to show loading
    if (typeof window === "undefined") return true; // SSR: show loading
    return false; // Client: we already tried to read cookie above
  });

  const setUserFromToken = (accessToken: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(accessToken);
      setUser({
        id: String(decoded.id),
        username: decoded.username,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Token decoding failed or token is invalid.", error);
      setUser(null);
    }
  };

  // Backup useEffect — handles edge cases where cookie wasn't available during init
  useEffect(() => {
    if (!user) {
      const accessToken = Cookies.get("access");
      if (accessToken) {
        setUserFromToken(accessToken);
      }
    }
    setLoading(false);
  }, []);

  const login = (access: string, refresh: string) => {
    Cookies.set("access", access, { expires: 7, secure: true, sameSite: "Lax" });
    Cookies.set("refresh", refresh, { expires: 30, secure: true, sameSite: "Lax" });
    setUserFromToken(access);
  };

  const logout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    setUser(null);
    window.location.href = "/login";
  };

  const contextValue: AuthContextValue = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};