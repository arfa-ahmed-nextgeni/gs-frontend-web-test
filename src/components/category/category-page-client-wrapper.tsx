"use client";

import { ReactNode } from "react";

import { CategoryTracker } from "@/components/analytics/category-tracker";
import { FilterProvider } from "@/contexts/category-filter-context";

import type { CategoryProperties } from "@/lib/analytics/models/event-models";

interface CategoryPageClientWrapperProps {
  category?: Partial<CategoryProperties>;
  children: ReactNode;
}

export const CategoryPageClientWrapper = ({
  category,
  children,
}: CategoryPageClientWrapperProps) => {
  return (
    <FilterProvider>
      {category && <CategoryTracker category={category} />}
      {children}
    </FilterProvider>
  );
};
