"use client";

import { useEffect, useRef, useCallback } from "react";
import axios from "axios";

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";

export const usePresence = () => {
  const statusRef = useRef<UserStatus>("OFFLINE");
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastApiCallRef = useRef<number>(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback(async (status: UserStatus) => {
    if (statusRef.current === status) return;
    
    // Throttle API calls - minimum 10 seconds between calls
    const now = Date.now();
    if (now - lastApiCallRef.current < 10000) return;
    
    try {
      lastApiCallRef.current = now;
      await axios.patch("/api/users/status", { status });
      statusRef.current = status;
    } catch (error) {
      console.error("[Presence] Failed to update status:", error);
    }
  }, []);

  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }

    // Debounce the ONLINE status update
    if (statusRef.current === "IDLE") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        updateStatus("ONLINE");
      }, 1000); // Wait 1 second before updating to ONLINE
    }

    // Set idle after 5 minutes of inactivity
    idleTimeoutRef.current = setTimeout(() => {
      if (statusRef.current === "ONLINE") {
        updateStatus("IDLE");
      }
    }, 5 * 60 * 1000); // 5 minutes
  }, [updateStatus]);

  useEffect(() => {
    // Set online when component mounts
    updateStatus("ONLINE");

    // Track user activity - only essential events
    const events = ["mousedown", "keydown", "touchstart"];
    
    // Throttled activity handler
    let lastEventTime = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastEventTime < 5000) return; // Throttle to once per 5 seconds
      lastEventTime = now;
      resetIdleTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus("IDLE");
      } else {
        updateStatus("ONLINE");
        resetIdleTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle before unload (closing tab/browser)
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        "/api/users/status",
        JSON.stringify({ status: "OFFLINE" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Initial idle timer
    resetIdleTimer();

    // Heartbeat - check every 2 minutes instead of 1
    const heartbeat = setInterval(() => {
      if (statusRef.current !== "OFFLINE" && statusRef.current !== "DND") {
        const timeSinceActivity = Date.now() - lastActivityRef.current;
        if (timeSinceActivity > 5 * 60 * 1000) {
          updateStatus("IDLE");
        }
      }
    }, 2 * 60 * 1000); // Check every 2 minutes

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      clearInterval(heartbeat);
      
      updateStatus("OFFLINE");
    };
  }, [updateStatus, resetIdleTimer]);

  return { updateStatus };
};
