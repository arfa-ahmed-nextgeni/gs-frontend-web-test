/* eslint-disable no-restricted-imports -- Standalone tools route has no next-intl context; useRouter is only used for router.refresh(). */
"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ApiActivityRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(() => {
          router.refresh();
        })
      }
      type="button"
      variant="outline"
    >
      {isPending ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
