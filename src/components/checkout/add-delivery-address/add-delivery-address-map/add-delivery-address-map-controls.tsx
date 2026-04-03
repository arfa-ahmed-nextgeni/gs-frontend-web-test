import Image from "next/image";

import { useTranslations } from "next-intl";

import CurrentLocationIcon from "@/assets/icons/current-location-icon.svg";

export const AddDeliveryAddressMapControls = ({
  onLocate,
}: {
  onLocate: () => void;
}) => {
  const t = useTranslations("AddDeliveryAddressPage.map");

  return (
    <div className="absolute bottom-5 end-5 z-10">
      <button
        aria-label="Locate current position"
        className="transition-default flex h-[30px] max-w-[150px] items-center justify-center gap-2 rounded-lg border border-[#F3F3F3] bg-white px-4 py-2 text-blue-500 hover:bg-blue-50"
        onClick={onLocate}
        type="button"
      >
        <Image
          alt="Locate"
          className="size-5"
          height={20}
          src={CurrentLocationIcon}
          width={20}
        />
        <span className="text-sm font-medium">{t("locateMe")}</span>
      </button>
    </div>
  );
};
