import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export default function DrawerCatchAll() {
  return null;
}

export function generateStaticParams() {
  return [{ catchAll: [ROUTE_PLACEHOLDER] }];
}
