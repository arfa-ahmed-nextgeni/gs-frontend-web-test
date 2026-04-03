import { IngredientCard } from "@/components/product/ingredient-pyramid/ingredient-card";
import { Ingredient } from "@/components/product/ingredient-pyramid/ingredient-pyramid.types";

type IngredientPyramidRowProps = {
  items: Ingredient[];
  startCol: number;
};

export const IngredientPyramidRow = ({
  items,
  startCol,
}: IngredientPyramidRowProps) => (
  <div className="gap-1.25 flex lg:grid lg:grid-cols-12 lg:gap-2.5">
    {items.map((item, index) => (
      <div
        className="lg:col-span-2"
        key={item.name}
        style={index === 0 ? { gridColumnStart: startCol } : {}}
      >
        <IngredientCard {...item} />
      </div>
    ))}
  </div>
);
