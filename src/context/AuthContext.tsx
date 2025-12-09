"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Install: npm install jwt-decode @types/jwt-decode
import { useRouter } from "next/navigation"; // Assuming you might want to use routing

// --- 1. Define Types for Clarity and Safety ---

// Define the structure of the data you store in the user state
export interface UserState {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

// Define the shape of the JWT payload we expect from the backend
// Adjust this if your Simple JWT token payload is customized
interface TokenPayload {
  user_id: string;
  picture?: string;
  email: string;
  name?: string; // If you include it in the token
  exp: number; // Expiration time
  iat: number; // Issued at time
  jti: string;
  token_type: string;
}

// Define the shape of the context value
interface AuthContextValue {
  user: UserState | null;
  loading: boolean;
  login: (access: string, refresh: string, userData: any) => void;
  logout: () => void;
  // refreshToken: () => Promise<void>; // Add if you implement refresh logic
}

// --- 2. Create Context ---

// Use null assertion or provide a default value that matches AuthContextValue
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// --- 3. AuthProvider Component ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize router if needed

  /**
   * Decodes the access token and sets the user state.
   */
  const setUserFromToken = (accessToken: string) => {
    try {
      const decoded = jwtDecode<TokenPayload>(accessToken);

      setUser({
        id: decoded.user_id,
        email: decoded.email,
        name: decoded.name, // Use 'name' if available in the token
        picture: decoded.picture
      });
    } catch (error) {
      console.error("Token decoding failed or token is invalid.", error);
      setUser(null);
    }
  };

  /**
   * Loads user state from cookies on initial component mount.
   */
  useEffect(() => {
    const accessToken = Cookies.get("access");

    if (accessToken) {
      setUserFromToken(accessToken);
    }
    setLoading(false); // Finished checking cookies
  }, []);

  /**
   * Handles successful login: stores tokens and sets user state.
   * @param access The JWT access token.
   * @param refresh The JWT refresh token.
   * @param userData Any extra data returned from the backend (optional).
   */
  const login = (access: string, refresh: string, userData: UserState) => {
    // Set cookies with appropriate expiration times
    // NOTE: Access token expiration should match backend setting (e.g., 5-60 minutes)
    Cookies.set("access", access, { expires: 7, secure: true, sameSite: 'Strict' }); // ~1 hour expiration
    Cookies.set("refresh", refresh, { expires: 30, secure: true, sameSite: 'Strict' }); // 30 days expiration

    // Set the user state immediately
    setUser(userData);
    
    // Optional: Redirect after successful login
    // router.push('/dashboard'); 
  };

  /**
   * Handles user logout: removes cookies and clears user state.
   */
  const logout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    setUser(null);
    // Optional: Redirect to login page
    // router.push('/login'); 
  };

  // The context value to be provided to consumers
  const contextValue: AuthContextValue = {
    user,
    loading,
    login,
    logout,
  };

  // Render the provider
  return (
    <AuthContext.Provider value={contextValue}>
      {loading ? <div>Loading user session...</div> : children}
    </AuthContext.Provider>
  );
};

// --- 4. Custom Hook for Consumers ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};