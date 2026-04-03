import { AddressForm } from "@/components/customer/addresses/manage-address/address-form";
import { ManageAddressDrawerLayout } from "@/components/customer/addresses/manage-address/manage-address-drawer-layout";

export const ManageAddressView = () => {
  return (
    <ManageAddressDrawerLayout>
      <AddressForm />
    </ManageAddressDrawerLayout>
  );
};
