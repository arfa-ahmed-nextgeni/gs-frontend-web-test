"use client";

import { withBlurZIndex } from "@/components/hoc/with-blur-z-index";

const Div = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const BlurDiv = withBlurZIndex(Div);
