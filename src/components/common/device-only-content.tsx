import { AsyncBoundary } from "@/components/common/async-boundary";
import { getIsMobileRequest } from "@/lib/utils/request-device";

export const DeviceOnlyContent = ({
  children,
  device,
  fallback = null,
}: {
  children: React.ReactNode;
  device: "desktop" | "mobile";
  fallback?: React.ReactNode;
}) => {
  return (
    <AsyncBoundary loadingFallback={fallback}>
      <DeviceOnlyContentInner device={device} fallback={fallback}>
        {children}
      </DeviceOnlyContentInner>
    </AsyncBoundary>
  );
};

const DeviceOnlyContentInner = async ({
  children,
  device,
  fallback,
}: {
  children: React.ReactNode;
  device: "desktop" | "mobile";
  fallback: React.ReactNode;
}) => {
  const isMobileRequest = await getIsMobileRequest();

  if (isMobileRequest !== (device === "mobile")) {
    return fallback;
  }

  return children;
};
