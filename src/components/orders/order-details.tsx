import React from "react";

import { Printer } from "lucide-react";

import { ProductImageWithFallback } from "@/components/product/product-image-with-fallback";
import { useOrderQuery } from "@/hooks/order/use-order";
import usePrice from "@/hooks/product/use-price";
import { OrderItem } from "@/lib/types/ui-types";

const OrderItemCard = ({ product }: { product: OrderItem }) => {
  const { price: itemTotal } = usePrice({
    amount: product.price * product.quantity,
    currencyCode: "USD",
  });
  return (
    <div className="flex gap-4" key={product.id}>
      <div className="border-border-base flex h-16 w-16 shrink-0 rounded-md border">
        <ProductImageWithFallback
          alt="Product image"
          className="rounded-md"
          height={64}
          src={product?.image?.thumbnail}
          width={64}
        />
      </div>
      <div className="flex-1">
        <p className="text-brand-dark text-15px">
          <span className="font-medium">{product.quantity} x </span>
          {product.name}
        </p>
      </div>
      <div className="text-brand-dark text-end">
        <p className="font-semibold">{itemTotal}</p>
      </div>
    </div>
  );
};

const OrderDetails: React.FC<{ className?: string }> = () => {
  const { data: order, isError, isLoading } = useOrderQuery("1");

  // Hooks must be called before any conditional returns
  const { price: subtotal } = usePrice(
    order && {
      amount: order.total,
      currencyCode: "USD",
    }
  );
  const { price: total } = usePrice(
    order && {
      amount: order.shipping_fee
        ? order.total + order.shipping_fee
        : order.total,
      currencyCode: "USD",
    }
  );
  const { price: shipping } = usePrice(
    order && {
      amount: order.shipping_fee,
      currencyCode: "USD",
    }
  );

  // If query fails, don't show loading indefinitely
  if (isLoading && !isError) {
    return <div className="p-8">Loading order details...</div>;
  }

  // If query fails or no order data, show empty state
  if (isError || !order) {
    return (
      <div className="p-8 text-center text-gray-500">
        Order details will be available shortly.
      </div>
    );
  }

  return (
    <div className={"px-5 py-5"}>
      <div className="border-border-base mb-5 flex items-center justify-between border-b pb-4">
        <h2 className="text-brand-dark text-xl font-medium">Order Summary</h2>
        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
          <Printer className="mr-1 h-4 w-4" />
          <span>Print</span>
        </button>
      </div>

      <div className="border-border-base border-b pb-5">
        <div className={"space-y-4"}>
          {order?.products.map((product, index) => (
            <OrderItemCard key={index} product={product} />
          ))}
        </div>
      </div>
      <div className="text-brand-dark mt-5 space-y-2">
        <div className="flex justify-between">
          <p className="m-0">Subtotal</p>
          <p className="font-semibold">{subtotal}</p>
        </div>
        <div className="flex justify-between">
          <p className="m-0">Shipping</p>
          <p className="font-semibold">{shipping}</p>
        </div>
        <div className="text-brand-dark flex items-center justify-between">
          <p className="m-0 font-bold">Order total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
