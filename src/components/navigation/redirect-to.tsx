"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";

type RedirectToProps = {
  href: string;
  replace?: boolean;
};

export function RedirectTo({ href, replace = true }: RedirectToProps) {
  const router = useRouter();

  useEffect(() => {
    if (replace) {
      router.replace(href);
    } else {
      router.push(href);
    }
  }, [href, replace, router]);

  return null;
}
