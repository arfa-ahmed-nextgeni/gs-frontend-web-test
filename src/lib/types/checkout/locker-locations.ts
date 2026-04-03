import { LockerType } from "@/lib/constants/checkout/locker-locations";

export interface FodelResponse {
  body: {
    code: number;
    data: {
      own: unknown;
      station_list: FodelStation[];
    };
    is_end: number;
    msg: string;
  };
  errors: Record<string, unknown>;
  exception: unknown[];
  message: string;
  status_code: number;
}

export interface FodelStation {
  address_info: string;
  area_name: string;
  avl_limit: number;
  category: string;
  city: string;
  cod_support: boolean;
  collection_point_id: number;
  country: string;
  distance: number;
  driver_name: string;
  extra_info: string;
  is_own_store: boolean;
  lat: number;
  lng: number;
  location_type: string;
  phone: string;
  proof_of_delivery: boolean;
  site_id: string;
  station_id: string;
  station_name: string;
  work_time: {
    Friday: string;
    Monday: string;
    Saturday: string;
    Sunday: string;
    Thursday: string;
    Tuesday: string;
    Wednesday: string;
  };
}

export interface RedboxPoint {
  accept_payment: boolean;
  address: {
    city: string;
    city_code: string;
    country: string;
    district: string;
    postal_code: string;
    redbox_zone: string;
    region: string;
    street: string;
  };
  address_ar: {
    city: string;
    city_code: string;
    country: string;
    district: string;
    postal_code: string;
    redbox_zone: string;
    region: string;
    street: string;
  };
  description: string;
  distance: number;
  free_storage_duration: number;
  host_name_ar: string;
  host_name_en: string;
  icon: string;
  id: string;
  indoor: boolean;
  industry: string;
  is_full: boolean;
  location: {
    lat: number;
    lng: number;
  };
  location_type: string;
  max_storage_duration: number;
  max_undelivered_return_duration: number;
  open_now: boolean;
  opening_hours: Array<{
    day_name: string;
    full_day: boolean;
    open: boolean;
    open_periods: Array<{
      end: string;
      start: string;
    }>;
    value: number;
  }>;
  point_name: string;
  point_type: string;
  status: string;
  thumbs: string[];
}

export interface RedboxResponse {
  body: {
    points: RedboxPoint[];
    success: boolean;
  };
  errors: Record<string, unknown>;
  exception: unknown[];
  message: string;
  status_code: number;
}

export interface UnifiedLockerLocation {
  acceptPayment?: boolean;
  address: string;
  addressAr?: string;
  category?: string;
  distance: number;
  id: string;
  isFull?: boolean;
  location: {
    lat: number;
    lng: number;
  };
  name: string;
  nameAr?: string;
  openNow?: boolean;
  operatingHours: string[];
  phone?: string;
  pointName?: string;
  // Raw data fields for form submission
  rawData?: {
    // Fodel fields
    fodelCity?: string;
    // Redbox fields
    redboxAddress?: RedboxPoint["address"];
    redboxAddressAr?: RedboxPoint["address_ar"];
  };
  type: LockerType;
}
