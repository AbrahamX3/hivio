"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

declare global {
  interface Window {
    umami?: {
      track: (
        eventName?: string | object | ((props: object) => object),
        eventData?: object
      ) => void;
      identify: (userId?: string | object, userData?: object) => void;
    };
  }
}

function identifyUser(user: {
  _id: string;
  email: string;
  name: string;
  image?: string | null;
}) {
  if (typeof window === "undefined" || !window.umami) {
    return;
  }

  window.umami.identify(user._id, {
    email: user.email,
    name: user.name,
    ...(user.image && { image: user.image }),
  });
}

export function UmamiAnalytics() {
  const user = useQuery(api.auth.getCurrentUser);
  const identifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const tryIdentify = () => {
      if (
        typeof window === "undefined" ||
        !window.umami ||
        !user ||
        identifiedRef.current === user._id
      ) {
        return;
      }

      identifyUser(user);
      identifiedRef.current = user._id;
    };

    tryIdentify();

    window.addEventListener("umami-loaded", tryIdentify);

    return () => {
      window.removeEventListener("umami-loaded", tryIdentify);
    };
  }, [user]);

  return null;
}
