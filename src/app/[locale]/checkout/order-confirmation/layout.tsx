export default function OrderConfirmationLayout({
  children,
  drawer,
}: LayoutProps<"/[locale]/checkout/order-confirmation">) {
  return (
    <>
      {children}
      {drawer}
    </>
  );
}
