import { useQuery } from "@tanstack/react-query";

import { useLocaleInfo } from "@/hooks/i18n/use-locale-info";
import { appApiRequest } from "@/lib/clients/app-client";
import { APP_API_ENDPOINTS } from "@/lib/constants/api/endpoints";
import { LockerType } from "@/lib/constants/checkout/locker-locations";
import { QUERY_KEYS } from "@/lib/constants/query-keys";
import { isOk } from "@/lib/utils/service-result";

import type {
  FodelResponse,
  RedboxResponse,
  UnifiedLockerLocation,
} from "@/lib/types/checkout/locker-locations";

interface FetchLockerLocationsParams {
  latitude: number;
  longitude: number;
  type: LockerType;
}

const fetchRedboxLocations = async (
  params: FetchLockerLocationsParams,
  language: string
): Promise<UnifiedLockerLocation[]> => {
  const response = await appApiRequest<RedboxResponse>({
    endpoint: APP_API_ENDPOINTS.LOCKER_LOCATIONS.REDBOX,
    options: {
      body: JSON.stringify({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: "50000",
      }),
      method: "POST",
    },
  });

  if (!isOk(response) || !response.data) {
    throw new Error(
      response.status === "error" && "error" in response
        ? response.error
        : "Failed to fetch Redbox locations"
    );
  }

  const data = response.data;

  if (data.status_code !== 200 || !data.body.success) {
    throw new Error(data.message || "Failed to fetch Redbox locations");
  }

  return data.body.points.map((point) => ({
    acceptPayment: point.accept_payment,
    address:
      language === "ar"
        ? point.address_ar.street
          ? `${point.address_ar.street}, ${point.address_ar.district}, ${point.address_ar.city}`
          : point.address_ar.district
            ? `${point.address_ar.district}, ${point.address_ar.city}`
            : point.address_ar.city
        : point.address.street
          ? `${point.address.street}, ${point.address.district}, ${point.address.city}`
          : point.address.district
            ? `${point.address.district}, ${point.address.city}`
            : point.address.city,
    category: point.location_type,
    distance: point.distance, // Distance in meters for Redbox
    id: point.id,
    isFull: point.is_full,
    location: {
      lat: point.location.lat,
      lng: point.location.lng,
    },
    name: language === "ar" ? point.host_name_ar : point.host_name_en,
    openNow: point.open_now,
    operatingHours: formatRedboxHours(point.opening_hours),
    pointName: point.point_name,
    rawData: {
      redboxAddress: point.address,
      redboxAddressAr: point.address_ar,
    },
    type: LockerType.Redbox,
  }));
};

const fetchFodelLocations = async (
  params: FetchLockerLocationsParams,
  language: string,
  country: string
): Promise<UnifiedLockerLocation[]> => {
  const response = await appApiRequest<FodelResponse>({
    endpoint: APP_API_ENDPOINTS.LOCKER_LOCATIONS.FODEL,
    options: {
      body: JSON.stringify({
        country,
        language,
        latitude: params.latitude,
        longitude: params.longitude,
      }),
      method: "POST",
    },
  });

  if (!isOk(response) || !response.data) {
    throw new Error(
      response.status === "error" && "error" in response
        ? response.error
        : "Failed to fetch Fodel locations"
    );
  }

  const data = response.data;

  if (data.status_code !== 200 || data.body.code !== 1001) {
    throw new Error(data.body.msg || "Failed to fetch Fodel locations");
  }

  return data.body.data.station_list.map((station) => ({
    address: station.address_info,
    category: station.category,
    codSupport: station.cod_support,
    distance: Math.round(station.distance),
    id: station.station_id,
    location: {
      lat: station.lat,
      lng: station.lng,
    },
    name: station.station_name,
    operatingHours: station.extra_info
      ? [station.extra_info]
      : formatFodelHours(station.work_time),
    phone: station.phone,
    pointName: station.site_id,
    rawData: {
      fodelCity: station.city,
    },
    type: LockerType.Fodel,
  }));
};

const formatRedboxHours = (
  openingHours: RedboxResponse["body"]["points"][0]["opening_hours"]
): string[] => {
  const days = openingHours
    .filter((day) => day.open)
    .map((day) => {
      if (day.full_day) {
        return `${day.day_name}: 24h`;
      }
      const periods = day.open_periods
        .map((period) => `${period.start}-${period.end}`)
        .join(", ");
      return `${day.day_name}: ${periods}`;
    });

  return days.length > 0 ? days : ["Closed"];
};

const formatFodelHours = (
  workTime: FodelResponse["body"]["data"]["station_list"][0]["work_time"]
): string[] => {
  return Object.entries(workTime).map(([day, hours]) => `${day}: ${hours}`);
};

export const useLockerLocations = (
  params: FetchLockerLocationsParams | null
) => {
  const { language, region } = useLocaleInfo();

  return useQuery<UnifiedLockerLocation[], Error>({
    enabled: !!(params && params.latitude && params.longitude && params.type),
    queryFn: async () => {
      if (!params) {
        throw new Error("Location parameters are required");
      }

      if (params.type === LockerType.Redbox) {
        return fetchRedboxLocations(params, language);
      } else {
        return fetchFodelLocations(params, language, region);
      }
    },
    queryKey: QUERY_KEYS.LOCKER_LOCATIONS({
      ...params,
      language,
      latitude: params?.latitude,
      longitude: params?.longitude,
      type: params?.type,
    }),
  });
};
