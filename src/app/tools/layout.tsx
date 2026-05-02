import type { Metadata } from "next";

import "../globals.css";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-locale="en" dir="ltr" lang="en">
      <body className="bg-bg-body text-text-primary min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
