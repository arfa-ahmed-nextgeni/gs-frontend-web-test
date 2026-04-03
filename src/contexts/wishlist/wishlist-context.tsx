"use client";

import { createContext, PropsWithChildren } from "react";

import { useUI } from "@/contexts/use-ui";
import { useWishlistQuery } from "@/hooks/queries/wishlist/use-wishlist-query";
import { Wishlist } from "@/lib/models/wishlist";

type WishlistContextType = {
  isLoading?: boolean;
  wishlist?: null | Wishlist;
};

const emptyWishlist = new Wishlist();

export const wishlistContext = createContext<undefined | WishlistContextType>(
  undefined
);

export const WishlistProvider = ({ children }: PropsWithChildren) => {
  const { data: wishlist, isLoading } = useWishlistQuery();

  const { isAuthorized } = useUI();

  return (
    <wishlistContext.Provider
      value={{
        isLoading,
        wishlist: isAuthorized ? wishlist || emptyWishlist : emptyWishlist,
      }}
    >
      {children}
    </wishlistContext.Provider>
  );
};
