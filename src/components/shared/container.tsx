import React from "react";

import cn from "classnames";

interface Props {
  children?: React.ReactNode;
  className?: string;
  el?: React.ElementType; // Correct type for dynamic elements/components
  variant?: Variant;
}

type Variant = "FullWidth" | "Large" | "Medium" | "Normal";

const Container: React.FC<Props> = ({
  children,
  className,
  el = "div",
  variant = "Normal",
}) => {
  const rootClassName = cn(className, {
    "max-w-full": variant === "FullWidth",
    "mx-auto max-w-[1200px] px-2.5 lg:px-2 xl:px-0": variant === "Normal",
    "mx-auto max-w-[1730px] px-4 md:px-6 2xl:px-20": variant === "Medium",
    "mx-auto max-w-[1870px] px-4 md:px-6 2xl:px-20": variant === "Large",
  });

  // Assert el as a React.ComponentType that accepts div props
  const Component = el as React.ComponentType<
    React.HTMLAttributes<HTMLDivElement>
  >;

  return <Component className={rootClassName}>{children}</Component>;
};

export default Container;
