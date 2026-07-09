import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/context/AuthContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuzzHire",
  description: "BuzzHire - Search | Recruitment | Consulting",
};

import { SwrProvider } from "@/components/providers/SwrProvider";
import { PusherProvider } from "@/components/providers/PusherProvider";
import VersionWatcher from "@/components/providers/VersionWatcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <GoogleOAuthProvider
          clientId="848116300203-bsq9l9i5gu9tcqc13h2i0jlns8encv9i.apps.googleusercontent.com"
        >
          <AuthProvider>
            <SwrProvider>
              <PusherProvider>
                <VersionWatcher />
                {children}
              </PusherProvider>
            </SwrProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
