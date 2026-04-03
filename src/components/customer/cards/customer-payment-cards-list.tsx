import { unauthorized } from "next/navigation";

import { AddPaymentCardDialog } from "@/components/customer/cards/add-payment-card-dialog";
import { CustomerPaymentCard } from "@/components/customer/cards/customer-payment-card";
import { PaymentCardsContextProvider } from "@/contexts/payment-cards-context";
import { getCustomerPaymentCards } from "@/lib/actions/customer/get-customer-payment-cards";
import { isUnauthenticated } from "@/lib/utils/service-result";

export const CustomerPaymentCardsList = async () => {
  const customerPaymentCards = await getCustomerPaymentCards();

  if (isUnauthenticated(customerPaymentCards)) {
    unauthorized();
  }

  const paymentCards = customerPaymentCards.data?.paymentCards;

  const paymentCardsLength = paymentCards?.length || 0;

  return (
    <PaymentCardsContextProvider paymentCardsLength={paymentCardsLength}>
      <AddPaymentCardDialog />
      <div className="gap-1.25 grid grid-cols-1 lg:grid-cols-2 lg:gap-2.5">
        {paymentCards?.map((paymentCard, index) => (
          <CustomerPaymentCard
            {...paymentCard}
            defaultExpanded={index === paymentCardsLength - 1}
            key={`${paymentCard.id}-${paymentCards[paymentCardsLength - 1]?.id}`}
          />
        ))}
      </div>
    </PaymentCardsContextProvider>
  );
};
