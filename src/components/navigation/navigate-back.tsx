"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";

export function NavigateBack() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, [router]);

  return null;
}
