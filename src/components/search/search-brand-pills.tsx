import { useTranslations } from "next-intl";

interface SearchBrandPillsProps {
  brands: string[];
  onBrandClick: (brand: string) => void;
}

const SearchBrandPills = ({ brands, onBrandClick }: SearchBrandPillsProps) => {
  const t = useTranslations("HomePage.header.search");

  if (!brands || brands.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-text-primary mx-4 text-sm font-semibold">
        {t("relevantBrands")}
      </h3>
      <div className="mx-2 flex flex-wrap gap-2">
        {brands.slice(0, 6).map((brand) => (
          <button
            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
            key={brand}
            onClick={() => onBrandClick(brand)}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBrandPills;
