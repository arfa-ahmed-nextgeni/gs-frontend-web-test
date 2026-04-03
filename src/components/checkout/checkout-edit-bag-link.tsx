"use client";

import { useTranslations } from "next-intl";

import { useCart } from "@/contexts/use-cart";
import { Link } from "@/i18n/navigation";
import { trackCancelCheckout } from "@/lib/analytics/events";

export function CheckoutEditBagLink() {
  const t = useTranslations("CheckoutPage");
  const { cart } = useCart();

  const handleClick = () => {
    trackCancelCheckout({ cart_id: cart?.id, current_step: "order_review" });
  };

  return (
    <div className="mb-2.5 hidden lg:block">
      <Link
        className="text-text-primary inline-flex items-center gap-2 text-sm font-medium"
        href="/cart"
        onClick={handleClick}
      >
        <span aria-hidden className="rtl:rotate-180">
          ←
        </span>
        <span>{t("editBag")}</span>
      </Link>
    </div>
  );
}
