import { parseAsString, useQueryState } from "nuqs";

import { QueryParamsKey } from "@/lib/constants/query-params";

export const useLetterParam = () => {
  const [letter, setLetter] = useQueryState(
    QueryParamsKey.Letter,
    parseAsString.withOptions({
      scroll: true,
    })
  );

  return { letter, setLetter };
};
