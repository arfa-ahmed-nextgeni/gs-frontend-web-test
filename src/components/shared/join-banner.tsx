"use client";

import { useState } from "react";

import Image from "next/image";

import StarIcon from "@/assets/icons/star.svg";
import { JoinModal } from "@/components/dialogs/join-modal";
import { StoreCode } from "@/lib/constants/i18n";

interface JoinBannerProps {
  linkText: string;
  showDesktop?: boolean;
  showMobile?: boolean;
  storeCode?: StoreCode;
  text: string;
}

export function JoinBanner({
  linkText,
  showDesktop = true,
  showMobile = true,
  storeCode,
  text,
}: JoinBannerProps) {
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const handleSubmitSuccess = () => {
    setIsBannerVisible(false);
    setIsJoinModalOpen(false);
  };

  return (
    <>
      {isBannerVisible && (
        <>
          {/* Desktop Banner */}
          {showDesktop && (
            <div className="hidden h-[41px] w-full items-center justify-center gap-1 bg-[#EAE4F3] text-[16px] font-normal text-[#374957] lg:flex">
              <Image
                alt="star"
                className="mr-2 h-5 w-5 rtl:ml-2 rtl:mr-0"
                src={StarIcon}
              />
              <span>{text}</span>
              <button
                className="ml-8 font-medium underline rtl:ml-0 rtl:mr-8"
                onClick={() => setIsJoinModalOpen(true)}
                type="button"
              >
                {linkText}
              </button>
            </div>
          )}

          {/* Mobile Banner */}
          {showMobile && (
            <button
              className="flex h-auto w-full items-center justify-center gap-1 bg-[#EAE4F3] px-2 py-2 text-[12px] font-normal text-[#374957] lg:hidden"
              onClick={() => setIsJoinModalOpen(true)}
              type="button"
            >
              <div className="flex items-center gap-1 text-center">
                <Image
                  alt="star"
                  className="h-[13px] w-[13px]"
                  src={StarIcon}
                />
                <span>{text}</span>
              </div>
            </button>
          )}
        </>
      )}

      <JoinModal
        onClose={() => setIsJoinModalOpen(false)}
        onJoin={() => {
          handleSubmitSuccess();
        }}
        open={isJoinModalOpen}
        storeCode={storeCode}
      />
    </>
  );
}
