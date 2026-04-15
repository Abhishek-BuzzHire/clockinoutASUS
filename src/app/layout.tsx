import type { Metadata } from "next";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";


export const metadata: Metadata = {
  title: "CRM",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className="antialiased"
      >
      <GoogleOAuthProvider
          clientId="848116300203-bsq9l9i5gu9tcqc13h2i0jlns8encv9i.apps.googleusercontent.com"
        >
          <AuthProvider>
        {children}
        </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
