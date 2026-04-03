import { ProductLayoutClient } from "@/app/[locale]/p/[urlKey]/product-layout-client";

export default function ProductLayout({
  children,
  drawer,
}: LayoutProps<"/[locale]/p/[urlKey]">) {
  return <ProductLayoutClient drawer={drawer}>{children}</ProductLayoutClient>;
}
