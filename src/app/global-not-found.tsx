/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";

import { NotFoundPage } from "@/components/shared/not-found-page";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "./globals.css";

export const metadata: Metadata = {
  description: "The page you are looking for could not be found.",
  title: "Page Not Found",
};

export default function GlobalNotFound() {
  return (
    <html className="antialiased" data-locale="en" dir="ltr" lang="en">
      <body className="bg-bg-body">
        <NotFoundPage
          action={
            <a
              className={cn(
                buttonVariants({
                  className:
                    "bg-btn-bg-primary text-text-inverse hover:bg-btn-bg-primary/90 h-12.5 min-w-67.5 rounded-xl px-5 text-xl font-medium",
                })
              )}
              data-slot="button"
              href="/"
            >
              Continue Shopping
            </a>
          }
          className="min-h-dvh justify-center"
          description="Use the search bar or visit our homepage to continue shopping."
          title="Sorry! The page you're looking for cannot be found."
        />
      </body>
    </html>
  );
}
