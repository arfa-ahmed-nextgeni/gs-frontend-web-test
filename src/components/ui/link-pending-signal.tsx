"use client";

import { useEffect, useRef } from "react";

// eslint-disable-next-line no-restricted-imports
import { useLinkStatus } from "next/link";

import {
  addPendingLink,
  removePendingLink,
} from "@/lib/stores/link-navigation-loading-store";

export const LinkPendingSignal = () => {
  const { pending } = useLinkStatus();
  const hasRegisteredPending = useRef(false);

  useEffect(() => {
    if (pending && !hasRegisteredPending.current) {
      addPendingLink();
      hasRegisteredPending.current = true;
    }

    if (!pending && hasRegisteredPending.current) {
      removePendingLink();
      hasRegisteredPending.current = false;
    }
  }, [pending]);

  useEffect(() => {
    return () => {
      if (hasRegisteredPending.current) {
        removePendingLink();
        hasRegisteredPending.current = false;
      }
    };
  }, []);

  return null;
};
