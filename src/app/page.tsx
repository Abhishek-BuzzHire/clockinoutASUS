"use client";

import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import axios, { AxiosError } from "axios";
import { useRouter } from 'next/navigation';
import { useAuth, UserState } from "@/context/AuthContext"; // Ensure the path is correct
import Image from "next/image";
import { useEffect } from "react";

// --- Define Types for Clarity and Safety ---

// Define the expected structure of the successful backend response
interface AuthResponseData {
  access: string;
  refresh: string;
  email: string;
  user_id: string; // The backend uses 'user_id'
  name?: string;
  picture?: string;
}

export default function LoginPage() {
  // Hooks should be called at the top of the component
  const { user, login, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/attendance'); // replace prevents back navigation to login
    }
  }, [user, loading, router]);

  /**
   * Handles the successful Google sign-in flow.
   * @param cred The CredentialResponse from Google OAuth.
   */
  const handleGoogleLoginSuccess = async (cred: CredentialResponse) => {
    // Ensure we have the ID token before proceeding
    const idToken = cred.credential;
    if (!idToken) {
      console.error("Google response missing ID token.");
      return;
    }

    try {
      // 1. Send ID token to your Django backend
      const response = await axios.post<AuthResponseData>(
        "https://buzzhire.trueledgrr.com/auth/google/", // Use the full URL for now
        { id_token: idToken }
      );

      // 2. Destructure data from the successful response
      const { access, refresh, email, user_id, name, picture } = response.data;

      // 3. Prepare userData object, mapping 'user_id' from backend to 'id' for context
      const userData: UserState = { id: user_id, email, name, picture };

      // 4. Call the context login function (access, refresh, userData)
      login(access, refresh, userData);

      // 5. Redirect user using the Next.js router
      router.push('/attendance');

    } catch (error) {
      // Handle Axios errors (network issues, 4xx/5xx status codes)
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string }>;

        const errorDetail =
          axiosError.response?.data?.error ?? axiosError.message;

        console.error("Google login failed (API call):", errorDetail);
      } else {
        console.error("An unexpected error occurred during login:", error);
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg px-10 py-10 text-center space-y-4">

        {/* Logo */}
        <div className="flex justify-center">
          <Image src={"/logo.webp"} alt="" height={40} width={40} />
        </div>

        {/* Headings */}
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome to <span className="text-red-600">Buzz</span><span className="text-blue-800">Hire</span> CRM
        </h1>

        <p className="text-gray-600">Please login</p>

        {/* Google Login wrapped in centered container */}
        <div className="flex justify-center mt-6">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => console.log("Login Failed")}
            theme="filled_blue"
            size="large"
            width="280"    // <–– prevents oversizing
            text="continue_with"
          />
        </div>

      </div>
    </div>
  );
}