"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

export default function VersionWatcher() {
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.txt?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const text = await res.text();
        const version = text.trim();
        if (!version) return;

        if (initialVersion.current === null) {
          initialVersion.current = version;
          console.log(`Initial frontend version recorded: ${version}`);
        } else if (initialVersion.current !== version) {
          console.log(`New frontend version detected (${version} vs ${initialVersion.current}). Showing toast...`);
          
          // Show a toast instead of forcefully reloading the page
          toast({
            title: "Update Available",
            description: "A new version of the app is available. Please refresh the page when you're ready.",
            duration: 10000, // Show for 10 seconds
          });
          
          // Update the ref so we don't keep showing the toast
          initialVersion.current = version;
        }
      } catch (err) {
        console.error("Error checking frontend version:", err);
      }
    };

    // Initial check on mount
    checkVersion();

    // Check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };
    const handleFocus = () => {
      checkVersion();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Poll every 15 minutes (15 * 60 * 1000 = 900000 ms)
    const interval = setInterval(checkVersion, 900000);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  return null;
}
