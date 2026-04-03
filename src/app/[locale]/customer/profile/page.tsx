import { unauthorized } from "next/navigation";

import { CompleteProfileAlert } from "@/components/customer/profile/complete-profile-alert";
import { ProfileForm } from "@/components/customer/profile/profile-form";
import { getCurrentCustomer } from "@/lib/actions/customer/get-current-customer";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export default async function CustomerProfilePage() {
  const currentCustomer = await getCurrentCustomer();

  if (isUnauthenticated(currentCustomer)) {
    unauthorized();
  }

  if (isError(currentCustomer)) {
    throw new Error(currentCustomer.error);
  }

  const customerData = currentCustomer.data;

  return (
    <div className="lg:mt-12.5 px-2.5 lg:px-0">
      {!customerData?.isProfileComplete && <CompleteProfileAlert />}
      <ProfileForm
        dateOfBirth={customerData?.dateOfBirth}
        email={customerData?.email}
        firstName={customerData?.firstName}
        gender={customerData?.gender}
        isProfileComplete={customerData?.isProfileComplete}
        lastName={customerData?.lastName}
        phoneNumber={customerData?.phoneNumber}
      />
    </div>
  );
}
