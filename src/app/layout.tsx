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
  title: "CRM",
  description: "",
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
          clientId="804678579643-hbddd8kf9ubsc1gr79tbsn2lesttfr26.apps.googleusercontent.com"
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
