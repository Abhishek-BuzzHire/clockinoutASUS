"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface AuthResponseData {
  access: string;
  refresh: string;
}

interface TokenPayload {
  id: string | number;
  username: string;
  role: string;
}

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);

  useEffect(() => {
    if (!loading && user && !returnUrl) {
      const home = user.role === "admin" ? "/list/attendance/admin" : "/list/attendance/employee";
      router.replace(home);
    }
  }, [user, loading, router]);

  const handleLoginSuccess = (access: string, refresh: string) => {
    login(access, refresh);

    if (returnUrl) {
      router.push(returnUrl);
    } else {
      const decoded = jwtDecode<TokenPayload>(access);
      const home = decoded.role === "admin" ? "/list/attendance/admin" : "/attendance";
      router.push(home);
    }
  };

  const handleGoogleLoginSuccess = async (cred: CredentialResponse) => {
    const idToken = cred.credential;
    if (!idToken) {
      console.error("Google response missing ID token.");
      return;
    }

    try {
      const response = await axios.post<AuthResponseData>(
        `${apiUrl}/auth/google/`,
        { id_token: idToken }
      );
      const { access, refresh } = response.data;
      handleLoginSuccess(access, refresh);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;
        const errorDetail = axiosError.response?.data?.error ?? axiosError.message;
        console.error("Google login failed (API call):", errorDetail);
      } else {
        console.error("An unexpected error occurred during login:", error);
      }
    }
  };

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await axios.post<{ access: string; refresh: string }>(
        `${apiUrl}/login/`,
        { username, password }
      );
      const { access, refresh } = response.data;
      handleLoginSuccess(access, refresh);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          display: flex; 
          justify-content:center;
        }

        /* ── LEFT PANEL ── */
        .lp-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 64px;
          background: #1e293b;
          overflow: hidden;
        }

        .lp-left-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .lp-left-glow {
          position: absolute;
          bottom: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .lp-left-content {
          position: relative;
          z-index: 1;
          max-width: 440px;
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 72px;
        }

        .lp-brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lp-brand-name {
          font-size: 17px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.01em;
        }

        .lp-brand-name span { color: #60a5fa; }

        .lp-headline {
          font-size: 40px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #f8fafc;
          margin-bottom: 16px;
        }

        .lp-headline em {
          font-style: normal;
          color: #60a5fa;
        }

        .lp-tagline {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 52px;
        }

        .lp-stats {
          display: flex;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
        }

        .lp-stat {
          flex: 1;
          padding: 18px 20px;
        }

        .lp-stat + .lp-stat {
          border-left: 1px solid rgba(255,255,255,0.08);
        }

        .lp-stat-num {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.03em;
          display: block;
        }

        .lp-stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          display: block;
          margin-top: 2px;
        }

        /* ── RIGHT PANEL ── */
        .lp-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          background: #ffffff;
        }

        .lp-card {
          width: 100%;
          max-width: 400px;
        }

        .lp-card-header {
          margin-bottom: 28px;
          text-align: center;
        }

        .lp-card-logo-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin: 0 auto 20px;
        }

        .lp-card-title {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .lp-card-subtitle {
          font-size: 14px;
          color: #64748b;
        }

        /* ── FIELDS ── */
        .lp-field { margin-bottom: 14px; }

        .lp-field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 15px;
          height: 15px;
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.2s;
        }

        .lp-input-wrap:focus-within .lp-input-icon { color: #2563eb; }

        .lp-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          color: #111827;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s ease;
        }

        .lp-input::placeholder { color: #9ca3af; }

        .lp-input:focus {
          border-color: #2563eb;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }

        .lp-forgot {
          text-align: center;
          margin: 4px 0 18px;
        }

        .lp-forgot-text {
          font-size: 13px;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
          transition: color 0.2s;
        }

        .lp-forgot-text:hover { color: #1d4ed8; }

        .lp-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 14px;
        }

        .lp-error span {
          font-size: 13px;
          color: #dc2626;
        }

        .lp-btn-submit {
          width: 100%;
          padding: 12px;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          border-radius: 10px;
          border: none;
          background: #2563eb;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
          box-shadow: 0 1px 3px rgba(37,99,235,0.25), 0 4px 12px rgba(37,99,235,0.15);
        }

        .lp-btn-submit:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(29,78,216,0.3), 0 8px 20px rgba(29,78,216,0.2);
        }

        .lp-btn-submit:active { transform: translateY(0); background: #1e40af; }

        .lp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .lp-divider-line { flex: 1; height: 1px; background: #e5e7eb; }

        .lp-divider-text {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
          white-space: nowrap;
        }

        .lp-google-wrap { display: flex; justify-content: center; }

        .lp-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .lp-footer-text { font-size: 12px; color: #9ca3af; line-height: 1.6; }
        .lp-footer-link { color: #2563eb; font-weight: 500; cursor: pointer; }

        @media (max-width: 768px) {
          .lp-root { grid-template-columns: 1fr; }
          .lp-left { display: none; }
          .lp-right { padding: 40px 24px; }
        }
      `}</style>

      <div className="lp-root">


        {/* ── RIGHT: Login Form ── */}
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-card-header">
              <div className="lp-card-logo-wrap">
                <Image src="/logo.webp" alt="" height={30} width={30} />
              </div>
              <h2 className="lp-card-title">Log in to your account</h2>
              <p className="lp-card-subtitle">Welcome back! Please enter your details.</p>
            </div>

            <div className="lp-field">
              <label className="lp-field-label">Username</label>
              <div className="lp-input-wrap">
                <svg className="lp-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="lp-input"
                  required
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-field-label">Password</label>

              <div className="lp-input-wrap relative">

                {/* Lock Icon */}
                <svg
                  className="lp-input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                {/* Input */}
                <input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lp-input pr-10"   // important padding-right
                  required
                />

                {/* Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

              </div>
            </div>

            <div className="lp-forgot">
              <span className="lp-forgot-text">Forgot Password?</span>
            </div>

            {error && (
              <div className="lp-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleUsernameLogin as any}
              className="lp-btn-submit"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span className="lp-divider-text">or continue with</span>
              <div className="lp-divider-line" />
            </div>

            <div className="lp-google-wrap">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => console.log("Login Failed")}
                theme="outline"
                size="large"
                width="400"
                text="login_with"
                logo_alignment="center"
              />
            </div>

            {/* <div className="lp-footer">
              <p className="lp-footer-text">
                By signing in, you agree to our{" "}
                <span className="lp-footer-link">Terms of Service</span>{" "}
                and{" "}
                <span className="lp-footer-link">Privacy Policy</span>.
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}