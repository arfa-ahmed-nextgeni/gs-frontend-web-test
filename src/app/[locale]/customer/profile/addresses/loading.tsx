import { CustomerAddressCardSkeleton } from "@/components/customer/addresses/customer-address-card-skeleton";

export default function CustomerAddressesLoading() {
  return (
    <div className="lg:mt-12.5 mt-2.5 flex flex-col gap-2.5 px-5 lg:px-0">
      <div className="bg-bg-default flex h-12 w-full animate-pulse items-center justify-center rounded-xl shadow-[0_1px_0_0_var(--color-bg-surface)]">
        <span className="w-35 h-5 rounded bg-gray-200" />
      </div>
      <div className="gap-1.25 grid grid-cols-1 lg:grid-cols-2 lg:gap-2.5">
        {[...Array(4)].map((_, index) => (
          <CustomerAddressCardSkeleton index={index} key={index} />
        ))}
      </div>
    </div>
  );
}
