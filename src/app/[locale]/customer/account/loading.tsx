import { AccountPanelSkeleton } from "@/components/customer/account-panel/account-panel-skeleton";

export default function CustomerAccountLoading() {
  return (
    <AccountPanelSkeleton
      containerProps={{
        className: "flex lg:hidden",
      }}
    />
  );
}
