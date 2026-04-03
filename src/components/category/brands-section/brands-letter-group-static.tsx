import { BrandCard } from "@/components/category/brands-section/brand-card";
import { GroupedBrands } from "@/lib/types/brands";

export const BrandsLetterGroupStatic = ({
  defaultAvailableLetters,
  defaultGroupedBrands,
}: {
  defaultAvailableLetters: string[];
  defaultGroupedBrands: GroupedBrands;
}) => {
  const groupedBrands = defaultGroupedBrands;

  const availableLetters = defaultAvailableLetters;

  const lettersToRender = availableLetters;

  if (!lettersToRender.length) {
    return null;
  }

  return (
    <div className="gap-12.5 flex w-full flex-col">
      {lettersToRender.map((letter, letterIndex) => {
        const brands = groupedBrands[letter] ?? [];

        if (!brands.length) {
          return null;
        }

        const id =
          letter === "#"
            ? "symbols"
            : /^[A-Z]$/.test(letter)
              ? letter.toLowerCase()
              : letter;

        return (
          <div className="flex flex-col gap-5" id={id} key={letter}>
            <div className="flex items-center gap-2.5">
              <p className="text-text-primary text-lg font-normal lg:text-2xl">
                {letter}
              </p>
              <span className="bg-bg-surface h-0.5 flex-1 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-[clamp(5px,calc(5px+(100vw-320px)*5/110),10px)] gap-y-[clamp(10px,calc(10px+(100vw-320px)*10/110),20px)]">
              {brands.map((brand) => (
                <BrandCard
                  brand={brand}
                  isFirstLetterGroup={letterIndex === 0}
                  key={brand.uid}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
