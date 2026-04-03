import { AccountPanel } from "@/components/customer/account-panel";

export default function AccountPage() {
  return (
    <AccountPanel
      containerProps={{
        className: "flex lg:hidden",
      }}
    />
  );
}
