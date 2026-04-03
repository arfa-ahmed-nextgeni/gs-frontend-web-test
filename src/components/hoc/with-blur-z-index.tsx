"use client";

import { useRef } from "react";

import { useBlurContext } from "@/contexts/blur-context";
import { ZIndexLevel } from "@/lib/constants/ui";

type WithBlurZIndexOptions = {
  defaultLevel?: ZIndexLevel;
};

export function withBlurZIndex<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithBlurZIndexOptions = {}
) {
  const { defaultLevel = ZIndexLevel.z5 } = options;

  const ComponentWithBlurZIndex: React.FC<{ hoverLevel?: ZIndexLevel } & P> = (
    props
  ) => {
    const hoverId = useRef<null | symbol>(null);
    const { addHover, removeHover } = useBlurContext();

    const { hoverLevel, ...restProps } = props;
    const levelToUse = hoverLevel ?? defaultLevel;

    interface MouseEventProps {
      onMouseEnter?: React.MouseEventHandler<any>;
      onMouseLeave?: React.MouseEventHandler<any>;
    }

    type PropsWithMouseEvents = MouseEventProps & P;

    return (
      <WrappedComponent
        {...(restProps as PropsWithMouseEvents)}
        onMouseEnter={(e: React.MouseEvent<any>) => {
          hoverId.current = addHover(levelToUse);
          (props as MouseEventProps).onMouseEnter?.(e);
        }}
        onMouseLeave={(e: React.MouseEvent<any>) => {
          if (hoverId.current) {
            removeHover(hoverId.current);
            hoverId.current = null;
          }
          (props as MouseEventProps).onMouseLeave?.(e);
        }}
      />
    );
  };

  ComponentWithBlurZIndex.displayName = `withBlurZIndex(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithBlurZIndex;
}
