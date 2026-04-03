import { CustomerAddressesList } from "@/components/customer/addresses/customer-addresses-list";

export default function CustomerAddressesPage() {
  return (
    <div className="lg:mt-12.5 mt-2.5 flex flex-col gap-2.5 px-5 lg:px-0">
      <CustomerAddressesList />
    </div>
  );
}
