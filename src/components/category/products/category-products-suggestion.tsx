import Image from "next/image";

import { useTranslations } from "next-intl";

import BulbIcon from "@/assets/icons/bulb-icon.svg";

export const CategoryProductsSuggestion = () => {
  const t = useTranslations("category.productsList");

  return (
    <div className="my-10 hidden flex-col items-center gap-2.5 lg:flex">
      <Image alt="tip" src={BulbIcon} />
      <div className="text-text-secondary text-sm font-medium">
        {t("useFiltersSuggestion")}
      </div>
    </div>
  );
};
