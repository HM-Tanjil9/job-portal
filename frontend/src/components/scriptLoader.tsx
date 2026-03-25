"use client";

import { useState, useEffect } from "react";

declare global {
  interface Window {
    SslCommerz?: any;
  }
}

const useSslcommerz = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If already loaded
    if (window.SslCommerz) {
      setLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="sslcommerz.com/embed.min.js"]',
    );

    if (existingScript) {
      // Wait for existing script to load
      const checkInterval = setInterval(() => {
        if (window.SslCommerz) {
          setLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    // Create and load script
    const script = document.createElement("script");
    // Add random param to prevent caching (important!)
    script.src = `https://sandbox.sslcommerz.com/embed.min.js?${Date.now()}`;
    script.async = true;

    script.onload = () => {
      setLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load SSLCommerz");
      setLoaded(false);
    };

    // Insert before first script (better than append)
    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.body.appendChild(script);
    }
  }, []);

  return loaded;
};

export default useSslcommerz;
