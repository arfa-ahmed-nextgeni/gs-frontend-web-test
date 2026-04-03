"use client";

import { useSearchParams as useNextSearchParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";

export const useSearchParams = useNextSearchParams;

export { usePathname, useRouter };
