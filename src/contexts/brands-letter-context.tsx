"use client";

import { createContext, useContext } from "react";

import { useLetterParam } from "@/hooks/brands/use-letter-param";

type BrandsLetterContextType = {
  selectedLetter: null | string;
  setSelectedLetter: (letter: null | string) => void;
};

const BrandsLetterContext = createContext<BrandsLetterContextType | undefined>(
  undefined
);

export function BrandsLetterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { letter: selectedLetter, setLetter: setSelectedLetter } =
    useLetterParam();

  return (
    <BrandsLetterContext.Provider value={{ selectedLetter, setSelectedLetter }}>
      {children}
    </BrandsLetterContext.Provider>
  );
}

export function useBrandsLetter() {
  const context = useContext(BrandsLetterContext);

  if (context === undefined) {
    throw new Error("useBrandsLetter must be used within BrandsLetterProvider");
  }

  return context;
}
