import { graphql } from "@/graphql";

export const AUTH_GRAPHQL_MUTATIONS = {
  REVOKE_CUSTOMER_TOKEN: graphql(`
    mutation RevokeCustomerToken {
      revokeCustomerToken {
        result
      }
    }
  `),
} as const;
