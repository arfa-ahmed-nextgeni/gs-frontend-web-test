"use client";

import Image from "next/image";

import BackIcon from "@/assets/icons/back-icon.svg";
import BagIcon from "@/assets/icons/bag-icon.svg";
import CustomerServiceIcon from "@/assets/icons/customer-service-icon.svg";
import FilterIcon from "@/assets/icons/filter-icon.svg";
import TrashIcon from "@/assets/icons/trash-icon.svg";
import VerifiedIcon from "@/assets/icons/verified-icon.svg";
import SearchIcon from "@/components/icons/search-icon";
import { ProductShareButton } from "@/components/product/product-details/product-share-button";
import { useSearchActions } from "@/components/search/search-container";
import { RouteTitle } from "@/components/shared/route-title";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobileTopBarContext } from "@/contexts/mobile-top-bar-context";
import { useProductReviews } from "@/contexts/product-reviews-context";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { CartButton } from "@/layouts/header/cart-button";
import { ROUTES } from "@/lib/constants/routes";

export type MobileTopBarRouteProps = {
  isAddAddress: boolean;
  isAddProductReview: boolean;
  isCategory: boolean;
  isCustomer: boolean;
  isOrderDetails: boolean;
  isProduct: boolean;
  isProductReviews: boolean;
  isProductRoot: boolean;
  isProfileRoot: boolean;
};

export const MobileTopBar = ({
  isAddAddress,
  isAddProductReview,
  isCategory,
  isCustomer,
  isOrderDetails,
  isProduct,
  isProductReviews,
  isProductRoot,
  isProfileRoot,
}: MobileTopBarRouteProps) => {
  const router = useRouter();

  const { openMobileSearch } = useSearchActions();

  const { handleBack, mobileTopBarTitle, productInfo } =
    useMobileTopBarContext();
  const { toggleSortByFilter } = useProductReviews();

  const backHref = isCategory
    ? ROUTES.ROOT
    : isCustomer
      ? isAddAddress
        ? ROUTES.CUSTOMER.PROFILE.ADDRESSES.ROOT
        : ROUTES.CUSTOMER.ACCOUNT
      : ROUTES.ROOT;

  const handleBackFn =
    isProduct || isCategory || isOrderDetails ? router.back : handleBack;

  return (
    <div className="flex flex-1 flex-row justify-between">
      <div className="flex flex-row gap-2.5">
        {handleBackFn ? (
          <button
            className="flex h-full items-center justify-center px-2.5"
            onClick={handleBackFn}
          >
            <Image alt="back" className="rtl:rotate-180" src={BackIcon} />
          </button>
        ) : (
          <Link
            className="flex h-full items-center justify-center px-2.5"
            href={backHref}
          >
            <Image alt="back" className="rtl:rotate-180" src={BackIcon} />
          </Link>
        )}
        {isProductRoot ? (
          <div className="flex max-w-[55vw] flex-col gap-px">
            <div className="gap-1.25 flex flex-row items-center">
              {productInfo?.brand ? (
                <>
                  <p className="text-text-secondary line-clamp-1 text-sm font-medium">
                    {productInfo?.brand}
                  </p>
                  <Image
                    alt="Verified"
                    className="size-2.5"
                    height={10}
                    src={VerifiedIcon}
                    width={10}
                  />
                </>
              ) : (
                <>
                  <Skeleton className="w-12.5 h-4" />
                  <Skeleton className="size-2.5" />
                </>
              )}
            </div>
            {productInfo?.name ? (
              <p className="text-text-primary line-clamp-1 text-xl font-medium">
                {productInfo?.name}
              </p>
            ) : (
              <Skeleton className="w-50 h-6" />
            )}
          </div>
        ) : (
          <div className="text-text-primary text-xl font-medium">
            {mobileTopBarTitle || <RouteTitle />}
          </div>
        )}
      </div>

      {isCategory && (
        <button onClick={openMobileSearch}>
          <SearchIcon />
        </button>
      )}

      {isCustomer &&
        (isProfileRoot ? (
          <Link href={ROUTES.CUSTOMER.DELETE_ACCOUNT}>
            <Image alt="" height={20} src={TrashIcon} unoptimized width={20} />
          </Link>
        ) : (
          <Link
            className="flex items-center justify-center"
            href={ROUTES.CUSTOMER_SERVICE}
          >
            <Image
              alt="customer service"
              className="h-4.25 w-5"
              height={17}
              src={CustomerServiceIcon}
              width={20}
            />
          </Link>
        ))}

      {isProduct && !isAddProductReview ? (
        isProductReviews ? (
          <button onClick={toggleSortByFilter}>
            <Image
              alt="sort by filter"
              className="h-4.25 w-5"
              height={17}
              src={FilterIcon}
              width={20}
            />
          </button>
        ) : (
          <div className="gap-7.5 flex flex-row items-center pe-2.5">
            <ProductShareButton variant="large" />
            <CartButton
              indicatorProps={{
                className: "!size-2",
              }}
            >
              <Image
                alt="Cart"
                className="size-5"
                height={20}
                src={BagIcon}
                width={20}
              />
            </CartButton>
          </div>
        )
      ) : null}
    </div>
  );
};
