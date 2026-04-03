import Image from "next/image";

import SpinnerDarkIcon from "@/assets/icons/spinner-dark-icon.svg";
import SpinnerIcon from "@/assets/icons/spinner-icon.svg";

export const SpinnerAssetsPreloader = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
    >
      <Image
        alt=""
        height={1}
        preload
        src={SpinnerIcon}
        unoptimized
        width={1}
      />
      <Image
        alt=""
        height={1}
        preload
        src={SpinnerDarkIcon}
        unoptimized
        width={1}
      />
    </div>
  );
};
