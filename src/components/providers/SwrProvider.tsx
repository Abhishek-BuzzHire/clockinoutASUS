"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

function localStorageProvider() {
  if (typeof window === "undefined") return new Map();

  // Load cache from localStorage
  const map = new Map(JSON.parse(localStorage.getItem("buzzhire-swr-cache") || "[]"));

  // Save cache on page unload
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("buzzhire-swr-cache", appCache);
  });

  // Also save every 5 seconds to ensure it persists during normal client navigation
  setInterval(() => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("buzzhire-swr-cache", appCache);
  }, 5000);

  return map;
}

export function SwrProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: localStorageProvider,
        revalidateOnFocus: false, // Prevents excessive refetches when switching tabs
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
