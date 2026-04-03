import React, { CSSProperties, JSXElementConstructor } from "react";

import cn from "classnames";

interface Props {
  children?: React.ReactNode;
  className?: string;
  html?: string;
  style?: CSSProperties;
  variant?: Variant;
}

type Variant =
  | "base"
  | "checkoutHeading"
  | "heading"
  | "mediumHeading"
  | "pageHeading"
  | "subHeading"
  | "title"
  | "titleLarge"
  | "titleMedium";

const Heading: React.FC<Props> = ({
  children,
  className,
  html,
  style,
  variant = "base",
}) => {
  const componentsMap: {
    [P in Variant]: React.ComponentType<any> | string;
  } = {
    base: "h3",
    checkoutHeading: "h3",
    heading: "h2",
    mediumHeading: "h3",
    pageHeading: "h1",
    subHeading: "h2",
    title: "h2", // Collection card
    titleLarge: "h2",
    titleMedium: "h3",
  };

  const Component:
    | JSXElementConstructor<any>
    | React.ComponentType<any>
    | React.ReactElement<any>
    | string = componentsMap![variant!];

  const htmlContentProps = html
    ? {
        dangerouslySetInnerHTML: { __html: html },
      }
    : {};

  return (
    <Component
      className={cn(
        "font-semibold",
        {
          "text-base uppercase sm:font-medium lg:text-base xl:leading-6":
            variant === "checkoutHeading",
          "text-brand-dark text-[16px] sm:font-semibold lg:leading-7":
            variant === "mediumHeading",
          "text-brand-dark text-[16px] xl:text-2xl xl:leading-8":
            variant === "titleLarge",
          "text-brand-dark text-base": variant === "title",
          "text-brand-dark text-base font-bold": variant === "titleMedium",
          "text-brand-dark text-lg font-bold lg:text-xl xl:text-[22px] xl:leading-8":
            variant === "heading",
          "text-brand-dark text-sm": variant === "base",
        },
        className
      )}
      style={style}
      {...htmlContentProps}
    >
      {children}
    </Component>
  );
};

export default Heading;
