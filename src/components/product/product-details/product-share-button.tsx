"use client";

import Image from "next/image";

import ShareUpIcon from "@/assets/icons/share-up-icon.svg";

const shareIconSizeVariant = {
  large: {
    className: "size-5",
    height: 20,
    width: 20,
  },
  small: {
    className: "mt-1.5 size-3.5",
    height: 14,
    width: 14,
  },
};

export const ProductShareButton = ({
  variant = "small",
}: {
  variant?: "large" | "small";
}) => {
  const shareProductPage = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          text: "Check out this product!",
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
    <button onClick={shareProductPage}>
      <Image
        alt="Share"
        className={shareIconSizeVariant[variant].className}
        height={shareIconSizeVariant[variant].height}
        src={ShareUpIcon}
        width={shareIconSizeVariant[variant].width}
      />
    </button>
  );
};
