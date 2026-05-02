import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

export const ProductDetailsLink = ({
  children,
  ...props
}: ComponentProps<typeof Link>) => {
  if (!props.href) {
    return <div className={props.className}>{children}</div>;
  }

  return <Link {...props}>{children}</Link>;
};
