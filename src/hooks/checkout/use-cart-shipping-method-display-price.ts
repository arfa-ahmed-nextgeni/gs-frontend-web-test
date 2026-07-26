import { useCallback, useMemo } from "react";

import { useCart } from "@/contexts/use-cart";

type CartShippingMethodDisplay = {
  mappedCarrierCode: string;
  mappedMethodCode: string;
  mappedMethodId: string;
  price?: ShippingMethodPrice;
  priceCurrency?: string;
  rawCarrierCode: string;
  rawMethodCode: string;
  rawMethodId: string;
};

type ShippingMethodDisplayPrice = {
  currency?: string;
  price: ShippingMethodPrice;
};

type ShippingMethodDisplaySource = {
  carrier_code?: string;
  currency?: string;
  id: string;
  method_code?: string;
  price: ShippingMethodPrice;
};

type ShippingMethodPrice = "free" | number;

const mapShippingCode = (code: null | string | undefined): string => {
  if (!code) return "";
  const lowerCode = code.toLowerCase();
  if (
    lowerCode === "flatrate" ||
    lowerCode === "flat_rate" ||
    lowerCode === "flaterate"
  ) {
    return "lambdashipping_flatrate";
  }
  return code;
};

const getFallbackDisplayPrice = (
  method: ShippingMethodDisplaySource
): ShippingMethodDisplayPrice => ({
  currency: method.currency,
  price: method.price,
});

const buildMethodDisplay = ({
  currency,
  rawCarrierCode,
  rawMethodCode,
  value,
}: {
  currency?: null | string;
  rawCarrierCode?: null | string;
  rawMethodCode?: null | string;
  value?: null | number;
}): CartShippingMethodDisplay => {
  const carrierCode = rawCarrierCode ?? "";
  const methodCode = rawMethodCode ?? "";
  const mappedCarrierCode = mapShippingCode(carrierCode);
  const mappedMethodCode = mapShippingCode(methodCode);

  return {
    mappedCarrierCode,
    mappedMethodCode,
    mappedMethodId: `${mappedCarrierCode}-${mappedMethodCode}`,
    price:
      typeof value === "number"
        ? ((value > 0 ? Number(value) : "free") as ShippingMethodPrice)
        : undefined,
    priceCurrency: currency ?? undefined,
    rawCarrierCode: carrierCode,
    rawMethodCode: methodCode,
    rawMethodId: `${carrierCode}-${methodCode}`,
  };
};

export function useCartShippingMethodDisplayPrice() {
  const { cart } = useCart();
  const selectedShippingMethod =
    cart?.shippingAddress?.selected_shipping_method;

  const cartMethodDisplays = useMemo(() => {
    const displays: CartShippingMethodDisplay[] = [];

    if (selectedShippingMethod) {
      displays.push(
        buildMethodDisplay({
          currency:
            selectedShippingMethod.price_incl_tax?.currency ??
            selectedShippingMethod.amount?.currency,
          rawCarrierCode: selectedShippingMethod.carrier_code,
          rawMethodCode: selectedShippingMethod.method_code,
          value:
            selectedShippingMethod.price_incl_tax?.value ??
            cart?.shippingFee ??
            selectedShippingMethod.amount?.value,
        })
      );
    }

    for (const method of cart?.shippingAddress?.available_shipping_methods ??
      []) {
      if (!method) continue;
      displays.push(
        buildMethodDisplay({
          currency: method.amount?.currency,
          rawCarrierCode: method.carrier_code,
          rawMethodCode: method.method_code,
          value: method.amount?.value,
        })
      );
    }

    return displays;
  }, [
    cart?.shippingAddress?.available_shipping_methods,
    cart?.shippingFee,
    selectedShippingMethod,
  ]);

  const getMethodDisplayPrice = useCallback(
    (method: ShippingMethodDisplaySource) => {
      const cartMethodDisplay = cartMethodDisplays.find(
        (display) =>
          (method.carrier_code === display.rawCarrierCode &&
            method.method_code === display.rawMethodCode) ||
          (method.carrier_code === display.mappedCarrierCode &&
            method.method_code === display.mappedMethodCode) ||
          method.id === display.rawMethodId ||
          method.id === display.mappedMethodId ||
          Boolean(
            display.rawMethodCode &&
            method.method_code === display.rawMethodCode
          ) ||
          Boolean(
            display.mappedMethodCode &&
            method.method_code === display.mappedMethodCode
          )
      );

      if (!cartMethodDisplay || cartMethodDisplay.price === undefined) {
        return getFallbackDisplayPrice(method);
      }

      return {
        currency: cartMethodDisplay.priceCurrency ?? method.currency,
        price: cartMethodDisplay.price,
      };
    },
    [cartMethodDisplays]
  );

  return { getMethodDisplayPrice };
}
