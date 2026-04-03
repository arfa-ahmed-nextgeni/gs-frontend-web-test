"use client";

import { ComponentProps, PropsWithChildren } from "react";

import { trackInviteFriend } from "@/lib/analytics/events";

export const ShareNavAction = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"button">>) => {
  const shareCurrentUrl = async () => {
    trackInviteFriend();
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          text: "Check out this website!",
          title: document.title,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Website link copied to clipboard!");
      } catch {
        alert("Sharing not supported in this browser.");
      }
    }
  };

  return (
    <button onClick={shareCurrentUrl} {...props}>
      {children}
    </button>
  );
};
