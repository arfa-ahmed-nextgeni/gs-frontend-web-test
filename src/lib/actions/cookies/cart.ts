"use server";

import { cache } from "react";

import { deleteCookie, getCookie, setCookie } from "@/lib/actions/cookies";
import { CookieName } from "@/lib/constants/cookies";

export const getCartId = cache(async () => {
  const cartId = await getCookie(CookieName.CART_ID);

  return cartId;
});

export const deleteCartId = async () => {
  await deleteCookie(CookieName.CART_ID);
};

export const setCartId = async (value: string) => {
  await setCookie(CookieName.CART_ID, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};
