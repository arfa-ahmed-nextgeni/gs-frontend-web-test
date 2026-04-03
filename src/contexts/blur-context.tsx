"use client";

import { createContext, useContext, useState } from "react";

import { ZIndexLevel } from "@/lib/constants/ui";

export type BlurContextType = {
  addHover: (level: ZIndexLevel) => symbol;
  blurZIndexLevel: null | ZIndexLevel;
  clearHoverStack: () => void;
  removeHover: (id: symbol) => void;
};

type BlurStackItem = {
  id: symbol;
  level: ZIndexLevel;
};

const BlurContext = createContext<BlurContextType | undefined>(undefined);

export const BlurContextProvider = ({ children }: React.PropsWithChildren) => {
  const [hoverStack, setHoverStack] = useState<BlurStackItem[]>([]);

  const addHover = (level: ZIndexLevel) => {
    const id = Symbol();
    setHoverStack((prev) => [...prev, { id, level }]);
    return id;
  };

  const removeHover = (id: symbol) => {
    setHoverStack((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHoverStack = () => {
    setHoverStack([]);
  };

  const blurZIndexLevel =
    hoverStack.length > 0 ? hoverStack[hoverStack.length - 1].level : null;

  return (
    <BlurContext.Provider
      value={{ addHover, blurZIndexLevel, clearHoverStack, removeHover }}
    >
      {children}
    </BlurContext.Provider>
  );
};

export const useBlurContext = () => {
  const context = useContext(BlurContext);
  if (!context) {
    throw new Error("useBlurContext must be used within a BlurProvider");
  }
  return context;
};
