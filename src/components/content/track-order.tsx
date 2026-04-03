"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "next/navigation";

import dayjs from "dayjs";
import { useTranslations } from "next-intl";

import Container from "@/components/shared/container";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { useShipmentTracking } from "@/hooks/order/use-shipment-tracking";

interface TrackFormData {
  orderNumber: string;
  trackingNumber: string;
}

interface TrackingUpdate {
  comments?: string;
  update_code: string;
  update_date_time: string;
  update_description: string;
  update_location: string;
}

const getProgressPercentage = (trackingStatus: string): number => {
  const statusMap: Record<string, number> = {
    Delivered: 100,
    Processing: 25,
    Returned: 100,
    Shipped: 50,
  };

  return statusMap[trackingStatus] || 25;
};

const getProgressColor = (trackingStatus: string): string => {
  const colorMap: Record<string, string> = {
    Delivered: "bg-green-500",
    Processing: "bg-blue-500",
    Returned: "bg-red-500",
    Shipped: "bg-orange-500",
  };

  return colorMap[trackingStatus] || "bg-blue-500";
};

const formatDateTime = (dateTimeString: string): string => {
  try {
    const date = dayjs(dateTimeString);
    return date.format("DD/MM/YYYY hh:mm A");
  } catch {
    return dateTimeString;
  }
};

const TrackingTimeline = ({ updates }: { updates: TrackingUpdate[] }) => {
  const t = useTranslations("TrackOrder");

  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <div className="text-start">
      <h3 className="mb-6 text-lg font-bold text-black">
        {t("trackingTimeline")}
      </h3>
      <div className="relative">
        <div className="space-y-6">
          {updates.map((update, index) => (
            <div className="relative flex items-start" key={index}>
              <div className="absolute left-5 top-0 h-3 w-3 rounded-full bg-red-500 rtl:left-auto rtl:right-5"></div>
              <div className="absolute left-6 top-4 h-full w-0.5 bg-red-500 rtl:left-auto rtl:right-6"></div>
              <div className="ml-12 flex-1 rtl:ml-auto rtl:mr-12">
                <div className="mb-2 text-sm font-semibold text-black">
                  {formatDateTime(update.update_date_time)}
                </div>
                <div className="mb-1 text-sm text-black">
                  {update.update_description}
                </div>
                <div className="text-xs text-gray-600">
                  {update.update_location}
                </div>
                {update.comments && update.comments.trim() && (
                  <div className="mt-2 text-xs italic text-gray-500">
                    {update.comments}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function TrackOrderPage() {
  const t = useTranslations("TrackOrder");
  const searchParams = useSearchParams();
  const { error, isLoading, reset, trackingData, trackOrder } =
    useShipmentTracking();

  const [formData, setFormData] = useState<TrackFormData>({
    orderNumber: "",
    trackingNumber: "",
  });

  const [validationError, setValidationError] = useState<string>("");
  const lastTrackedParamsRef = useRef<null | string>(null);

  const queryParamsData = useMemo(() => {
    const rawOrderNumber =
      searchParams.get("orderNumber") || searchParams.get("increment_id") || "";
    const trackingNumber = searchParams.get("trackingNumber") || "";

    let decodedOrderNumber = rawOrderNumber;
    if (rawOrderNumber) {
      try {
        decodedOrderNumber = atob(rawOrderNumber);
      } catch {
        decodedOrderNumber = rawOrderNumber;
      }
    }

    return {
      decodedOrderNumber,
      trackingNumber,
    };
  }, [searchParams]);

  useEffect(() => {
    const { decodedOrderNumber, trackingNumber } = queryParamsData;

    if (decodedOrderNumber || trackingNumber) {
      setFormData((prev) => {
        if (
          prev.orderNumber === decodedOrderNumber &&
          prev.trackingNumber === trackingNumber
        ) {
          return prev;
        }

        return {
          orderNumber: decodedOrderNumber,
          trackingNumber,
        };
      });
    }
  }, [queryParamsData]);

  useEffect(() => {
    const { decodedOrderNumber, trackingNumber } = queryParamsData;

    if (!decodedOrderNumber || !trackingNumber) {
      lastTrackedParamsRef.current = null;
      return;
    }

    const trackingParamsKey = `${decodedOrderNumber}:${trackingNumber}`;
    if (lastTrackedParamsRef.current !== trackingParamsKey) {
      lastTrackedParamsRef.current = trackingParamsKey;
      trackOrder(decodedOrderNumber, trackingNumber);
    }
  }, [queryParamsData, trackOrder]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orderNumber || !formData.trackingNumber) {
      setValidationError(t("bothFieldsRequired"));
      return;
    }

    setValidationError("");

    await trackOrder(formData.orderNumber, formData.trackingNumber);
  };

  return (
    <Container>
      <div className="w-full rounded-md bg-white p-5 md:p-10">
        <div>
          {!trackingData ? (
            <>
              <div className="mx-auto max-w-md space-y-6">
                <h1 className="mb-8 text-2xl font-bold text-black">
                  {t("title")}
                </h1>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <FloatingLabelInput
                    inputProps={{
                      name: "orderNumber",
                      onChange: handleChange,
                      type: "text",
                      value: formData.orderNumber,
                    }}
                    label={t("orderNumber")}
                  />

                  <FloatingLabelInput
                    inputProps={{
                      name: "trackingNumber",
                      onChange: handleChange,
                      type: "text",
                      value: formData.trackingNumber,
                    }}
                    label={t("trackingNumber")}
                  />

                  <p className="text-start text-sm text-black">
                    {t("instructions")}
                  </p>

                  {error && (
                    <div className="rounded-md bg-red-50 p-4 text-start">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {validationError && (
                    <div className="rounded-md bg-yellow-50 p-4 text-start">
                      <p className="text-sm text-yellow-600">
                        {validationError}
                      </p>
                    </div>
                  )}

                  <FormSubmitButton className="w-full" isSubmitting={isLoading}>
                    {t("trackButton")}
                  </FormSubmitButton>
                </form>

                <div className="mt-8 text-start">
                  <h2 className="mb-4 text-lg font-bold text-black">
                    {t("assistanceTitle")}
                  </h2>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      {t("assistanceText1")}{" "}
                      <span className="text-red-600">
                        {t("goldenScentAccount")}
                      </span>
                      .
                    </p>
                    <p>
                      {t("assistanceText2")}{" "}
                      <span className="font-semibold" dir="ltr">
                        {t("customerServicePhone")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-black">
                  {t("orderNumberTitle")} {formData.orderNumber}
                </h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor((trackingData as any).tracking_status || trackingData.delivery_status)}`}
                      style={{
                        width: `${getProgressPercentage((trackingData as any).tracking_status || trackingData.delivery_status)}%`,
                      }}
                    ></div>
                  </div>
                  {(trackingData as any).tracking_status === "Returned" ? (
                    <div className="mt-2 flex justify-center text-xs text-gray-600">
                      <span className="font-semibold text-red-600" dir="auto">
                        {t("returned")}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="mt-2 flex justify-between text-xs text-gray-600"
                      dir="auto"
                    >
                      <span
                        className={
                          (trackingData as any).tracking_status === "Processing"
                            ? "font-semibold text-blue-600"
                            : ""
                        }
                      >
                        {(trackingData as any).tracking_status === "Processing"
                          ? t("shipmentCreatedCaps")
                          : t("shipmentCreated")}
                      </span>
                      <span
                        className={
                          (trackingData as any).tracking_status === "Shipped"
                            ? "font-semibold text-orange-600"
                            : ""
                        }
                      >
                        {t("inProgress")}
                      </span>
                      <span
                        className={
                          (trackingData as any).tracking_status === "Delivered"
                            ? "font-semibold text-green-600"
                            : ""
                        }
                      >
                        {t("delivered")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-start">
                <h3 className="mb-4 text-lg font-bold text-black">
                  {t("orderDetails")}
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>{t("grandTotal")}:</strong>{" "}
                    {parseFloat(trackingData.grand_total).toFixed(2)} SAR
                  </p>
                  <p>
                    <strong>{t("carrier")}:</strong> {trackingData.carrier}
                  </p>
                  <p>
                    <strong>{t("trackingNumberLabel")}:</strong>{" "}
                    {formData.trackingNumber}
                  </p>
                  <p>
                    <strong>{t("deliveryStatus")}:</strong>{" "}
                    {(trackingData as any).tracking_status ||
                      trackingData.delivery_status}
                  </p>
                </div>
              </div>

              {trackingData.updates && (
                <TrackingTimeline updates={trackingData.updates} />
              )}

              <div className="pt-4 text-center">
                <button
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                  onClick={() => {
                    reset();
                    setFormData({
                      orderNumber: "",
                      trackingNumber: "",
                    });
                    setValidationError("");
                  }}
                >
                  {t("trackAnotherOrder")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

export default TrackOrderPage;
