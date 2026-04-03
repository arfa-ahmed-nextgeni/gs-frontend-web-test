import { ROUTE_PLACEHOLDER } from "@/lib/constants/routes";

export default function DialogCatchAll() {
  return null;
}

export function generateStaticParams() {
  return [{ catchAll: [ROUTE_PLACEHOLDER] }];
}
