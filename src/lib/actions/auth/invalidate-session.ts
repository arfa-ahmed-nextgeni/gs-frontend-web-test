"use server";

import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { deleteCookie } from "@/lib/actions/cookies";
import { getAuthToken } from "@/lib/actions/cookies/auth";
import { deleteCustomerId } from "@/lib/actions/cookies/customer";
import { graphqlRequest } from "@/lib/clients/graphql";
import { AUTH_GRAPHQL_MUTATIONS } from "@/lib/constants/api/graphql/auth";
import { CookieName } from "@/lib/constants/cookies";

export async function invalidateSession(redirectTo?: string) {
  try {
    const authToken = await getAuthToken();

    if (authToken) {
      await graphqlRequest({
        authToken,
        query: AUTH_GRAPHQL_MUTATIONS.REVOKE_CUSTOMER_TOKEN,
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    await deleteCookie(CookieName.AUTH_TOKEN);
    await deleteCookie(CookieName.CART_ID);
    // Keep device id cookie to preserve recently viewed continuity
    // across logout/login and guest/authenticated sessions.
    await deleteCustomerId();

    const locale = await getLocale();

    if (redirectTo) {
      redirect({ href: redirectTo, locale });
    }
  }
}
