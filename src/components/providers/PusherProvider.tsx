"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { useSWRConfig } from "swr";

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    // Initialize Pusher only on the client side
    const pusher = new Pusher("4dd64d9dc091254c62be", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("dashboard-channel");
    
    // Bind to the 'refresh' event sent from Django
    channel.bind("refresh", (data: any) => {
      console.log("🔥 Pusher refresh event received:", data);
      
      // Tell SWR to fetch new data in the background for all active queries
      mutate(
        () => true, // match all keys
        undefined,  // do not immediately overwrite local cache data
        { revalidate: true } // trigger a background re-fetch
      );
    });

    // Bind to the 'attendance_update' event sent from Django
    channel.bind("attendance_update", (data: any) => {
      console.log("🔥 Pusher attendance_update event received:", data);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("attendance_update", { detail: data }));
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [mutate]);

  return <>{children}</>;
}
