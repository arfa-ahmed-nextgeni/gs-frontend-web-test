"use server";

import { cache } from "react";

import { deleteCookie, getCookie, setCookie } from "@/lib/actions/cookies";
import { CookieName } from "@/lib/constants/cookies";

export const getCustomerId = cache(async () => {
  const customerId = await getCookie(CookieName.CUSTOMER_ID);

  return customerId;
});

export const deleteCustomerId = async () => {
  await deleteCookie(CookieName.CUSTOMER_ID);
};

export const deleteCustomerUuid = async () => {
  await deleteCookie(CookieName.CUSTOMER_UUID);
};

export const setCustomerId = async (value: string) => {
  await setCookie(CookieName.CUSTOMER_ID, value, {
    httpOnly: false, // Allow client-side reading for analytics
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const setCustomerUuid = async (value: string) => {
  await setCookie(CookieName.CUSTOMER_UUID, value, {
    httpOnly: false, // Allow client-side reading for analytics
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export const getCustomerUuid = cache(async () => {
  const customerUuid = await getCookie(CookieName.CUSTOMER_UUID);

  return customerUuid;
});
