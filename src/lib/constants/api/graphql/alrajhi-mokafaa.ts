import { graphql } from "@/graphql";

export const ALRAJHI_MOKAFAA_GRAPHQL_MUTATIONS = {
  AUTHENTICATE_CUSTOMER: graphql(`
    mutation AuthenticateMokafaaCustomer(
      $cartId: String!
      $mobileNumber: String!
    ) {
      authenticateMokafaaCustomer(
        input: { cart_id: $cartId, mobile_number: $mobileNumber }
      ) {
        message
        status_code
        body {
          otp {
            currency
            otp_token
            otp_token_expired_in_min
          }
        }
        error_code
      }
    }
  `),

  REDEEM_POINTS: graphql(`
    mutation RedeemMokafaaPoints(
      $amount: Float!
      $cartId: String!
      $otpToken: String!
      $otpValue: String!
    ) {
      redeemMokafaaPoints(
        input: {
          amount: $amount
          cart_id: $cartId
          otp_token: $otpToken
          otp_value: $otpValue
        }
      ) {
        message
        status_code
        body {
          discount_amount
          merchant
          points_amount
          request_id
          transaction_date
          transaction_id
          transaction_type
        }
        error_code
      }
    }
  `),

  REVERSE_POINTS: graphql(`
    mutation ReverseMokafaaPoints($cartId: String!) {
      reverseMokafaaPoints(input: { cart_id: $cartId }) {
        message
        status_code
        body {
          request_id
        }
      }
    }
  `),
} as const;
