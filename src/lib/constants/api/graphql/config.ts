import { graphql } from "@/graphql";

export const CONFIG_GRAPHQL_QUERIES = {
  GET_COUNTRIES: graphql(`
    query GetCountries {
      countries {
        id
        two_letter_abbreviation
        three_letter_abbreviation
        full_name_locale
        full_name_english
        available_regions {
          id
          code
          name
        }
      }
    }
  `),
};
