import { AccountNavEntry } from "@/components/customer/account-panel/account-menu.config";
import { AccountNavItem } from "@/components/customer/account-panel/account-nav-item";
import { AccountNavMeta } from "@/components/customer/account-panel/account-nav-meta";
import { useStoreCode } from "@/hooks/i18n/use-store-code";
import { cn } from "@/lib/utils";

export const AccountNavList = ({
  className,
  entries,
  isProfileComplete,
}: {
  className?: string;
  entries: AccountNavEntry[];
  isProfileComplete?: boolean;
}) => {
  const { storeCode } = useStoreCode();

  const visibleEntries = entries.filter(
    (e) => !e.visibleInStores || e.visibleInStores.includes(storeCode)
  );

  return (
    <nav aria-label="Account navigation">
      <ul className={cn("flex flex-col overflow-hidden", className)}>
        {visibleEntries.map((e, index) => {
          let itemClassName = e.className;

          // On desktop, find the last item before a new grouped section (which has lg:mt-2.5)
          const nextItem = visibleEntries[index + 1];
          const isLastBeforeGap =
            nextItem && nextItem.className?.includes("lg:mt-2.5");

          // Add bottom rounded corners to the last item of the first group
          if (isLastBeforeGap) {
            itemClassName = cn(itemClassName, "lg:rounded-b-xl");
          }

          return (
            <li key={e.id}>
              <AccountNavItem {...e} className={itemClassName}>
                <AccountNavMeta
                  id={e.id}
                  isProfileComplete={isProfileComplete}
                />
              </AccountNavItem>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
