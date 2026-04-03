"use client";

interface PaymentDowntimeAlertProps {
  message: string;
}

export function PaymentDowntimeAlert({ message }: PaymentDowntimeAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="mx-4 mb-3 mt-2 rounded-lg bg-[#FFF5F5] px-4 py-3">
      <p className="text-text-primary mb-1 text-sm font-semibold">{message}</p>
    </div>
  );
}
