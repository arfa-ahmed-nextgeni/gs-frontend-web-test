"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function ApiActivityCopyButton({ text }: { text: string }) {
  const resetTimeoutReference = useRef<null | number>(null);
  const [status, setStatus] = useState<"copied" | "failed" | "idle">("idle");

  async function handleCopy() {
    if (resetTimeoutReference.current) {
      window.clearTimeout(resetTimeoutReference.current);
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    resetTimeoutReference.current = window.setTimeout(() => {
      setStatus("idle");
    }, 2_000);
  }

  return (
    <Button onClick={handleCopy} size="sm" type="button" variant="outline">
      {status === "copied"
        ? "Copied"
        : status === "failed"
          ? "Copy failed"
          : "Copy"}
    </Button>
  );
}
