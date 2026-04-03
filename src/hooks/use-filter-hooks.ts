"use client";

import { useState } from "react";

import { useUI } from "@/contexts/use-ui";

export const useFilterSidebar = () => {
  const { closeFilter } = useUI();
  return { closeFilter };
};

export const useFilterControls = () => {
  const [isOnSale, setIsOnSale] = useState(false);
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;
  const DEFAULT_PRICE_RANGE: [number, number] = [0, 500];

  const [selectedFilters, setSelectedFilters] = useState<{
    categories: { [key: string]: boolean };
    colors: { [key: string]: boolean };
    price: [number, number];
    sizes: { [key: string]: boolean };
  }>({
    categories: {},
    colors: {},
    price: DEFAULT_PRICE_RANGE,
    sizes: {},
  });

  const handleFilterChange = (
    section: "categories" | "colors" | "price" | "sizes",
    id: string,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [id]: checked,
      },
    }));
  };

  const handlePriceChange = (value: [number, number]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      price: value,
    }));
  };

  const clearFilter = (section: keyof typeof selectedFilters) => {
    if (section === "price") {
      setSelectedFilters((prev) => ({ ...prev, price: DEFAULT_PRICE_RANGE }));
    } else {
      setSelectedFilters((prev) => ({ ...prev, [section]: {} }));
    }
  };

  const hasSelectedFilters = (section: keyof typeof selectedFilters) => {
    return Object.values(selectedFilters[section]).some((value) => value);
  };

  const isPriceRangeSelected = () => {
    return (
      selectedFilters.price[0] !== DEFAULT_PRICE_RANGE[0] ||
      selectedFilters.price[1] !== DEFAULT_PRICE_RANGE[1]
    );
  };

  const getPriceRangeLabel = () => {
    if (!isPriceRangeSelected()) return "Price";
    return `$${selectedFilters.price[0]} - $${selectedFilters.price[1]}`;
  };

  return {
    clearFilter,
    getPriceRangeLabel,
    handleFilterChange,
    handlePriceChange,
    hasSelectedFilters,
    isOnSale,
    isPriceRangeSelected,
    MAX_PRICE,
    MIN_PRICE,
    selectedFilters,
    setIsOnSale,
  };
};

export const useFilters = () => {
  const [isOnSale, setIsOnSale] = useState(true);
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;
  const DEFAULT_PRICE_RANGE: [number, number] = [0, 500];

  const [sectionsOpen, setSectionsOpen] = useState({
    categories: true,
    colors: true,
    price: true,
    sizes: true,
  });

  const [selectedFilters, setSelectedFilters] = useState<{
    categories: Record<string, boolean>;
    colors: Record<string, boolean>;
    sizes: Record<string, boolean>;
  }>({
    categories: {},
    colors: {},
    sizes: {},
  });

  const [priceRange, setPriceRange] =
    useState<[number, number]>(DEFAULT_PRICE_RANGE);

  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (
    section: "categories" | "colors" | "price" | "sizes"
  ) => {
    setSectionsOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFilterChange = (
    section: "categories" | "colors" | "sizes",
    id: string,
    checked: boolean
  ) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [id]: checked,
      },
    }));
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  return {
    expandedCategories,
    handleFilterChange,
    handlePriceRangeChange,
    isOnSale,
    MAX_PRICE,
    MIN_PRICE,
    priceRange,
    sectionsOpen,
    selectedFilters,
    setIsOnSale,
    toggleCategoryExpand,
    toggleSection,
  };
};
