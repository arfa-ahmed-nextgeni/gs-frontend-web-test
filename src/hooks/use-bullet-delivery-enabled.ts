import { useStoreConfig } from "@/contexts/store-config-context";
import { isBulletEnabledFromStores } from "@/lib/utils/bullet-delivery/eligibility";

export const useBulletDeliveryEnabled = () => {
  const { storeConfig } = useStoreConfig();

  return isBulletEnabledFromStores(storeConfig);
};
