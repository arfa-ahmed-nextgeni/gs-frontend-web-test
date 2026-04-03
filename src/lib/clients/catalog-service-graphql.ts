import { TypedDocumentString } from "@/catalog-service-graphql/graphql";
import {
  CATALOG_SERVICE_BASE_URL,
  CATALOG_SERVICE_ENVIRONMENT_ID,
  CATALOG_SERVICE_X_API_KEY,
} from "@/lib/config/server-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";
import { StoreCode } from "@/lib/constants/i18n";

interface GraphQLError {
  extensions?: {
    [key: string]: any;
    code?: string;
    exception?: {
      stacktrace?: string[];
    };
  };
  locations?: Array<{
    column: number;
    line: number;
  }>;
  message: string;
  path?: Array<number | string>;
}

type GraphqlRequestParams<TResult, TVariables> = {
  authToken?: null | string;
  catalogStoreCode?: string;
  catalogWebsiteCode?: string;
  query: TypedDocumentString<TResult, TVariables>;
  requestInit?: RequestInit;
  storeCode: StoreCode;
  variables?: TVariables;
};

interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
}

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public response: GraphQLResponse<any>,
    public status: number
  ) {
    super(message);
    this.name = "GraphQLRequestError";
  }
}

export async function catalogServiceGraphqlRequest<
  TResult,
  TVariables = Record<string, never>,
>({
  authToken,
  catalogStoreCode,
  catalogWebsiteCode,
  query,
  requestInit,
  storeCode,
  variables,
}: GraphqlRequestParams<TResult, TVariables>): Promise<
  GraphQLResponse<TResult>
> {
  const headers = new Headers();

  headers.set(HEADERS.ACCEPT, "application/json");
  headers.set(HEADERS.CONTENT_TYPE, "application/json");
  headers.set(HEADERS.MAGENTO_STORE_VIEW_CODE, storeCode);
  headers.set(HEADERS.MAGENTO_WEBSITE_CODE, catalogWebsiteCode || "sa");
  headers.set(
    HEADERS.MAGENTO_STORE_CODE,
    catalogStoreCode || "main_website_store"
  );
  headers.set(HEADERS.X_API_KEY, CATALOG_SERVICE_X_API_KEY);
  headers.set(HEADERS.MAGENTO_ENVIRONMENT_ID, CATALOG_SERVICE_ENVIRONMENT_ID);
  if (authToken) headers.set(HEADERS.AUTHORIZATION, `Bearer ${authToken}`);

  const requestBody = {
    query,
    ...(variables ? { variables } : {}),
  };

  const response = await fetch(CATALOG_SERVICE_BASE_URL, {
    body: JSON.stringify(requestBody),
    headers,
    method: "POST",
    signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
    ...requestInit,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Catalog Service Error:", {
      body: errorText,
      status: response.status,
      statusText: response.statusText,
      url: CATALOG_SERVICE_BASE_URL,
    });
    throw new Error(
      `HTTP Error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`
    );
  }

  const result = await response.json();

  if (result.errors) {
    console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
  }

  return result;
}
