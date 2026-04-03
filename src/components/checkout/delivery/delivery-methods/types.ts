export interface DeliveryMethod {
  carrier_code?: string;
  carrier_title?: string;
  currency?: string;
  estimatedTime?: string;
  icon?: string;
  iconAlt?: string;
  id: string;
  method_code?: string;
  name: string;
  price: "free" | number;
}
