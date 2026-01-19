"use client";

import Script from "next/script";

export function UmamiScript() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) {
    return null;
  }

  return (
    <Script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      onLoad={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("umami-loaded"));
        }
      }}
    />
  );
}
