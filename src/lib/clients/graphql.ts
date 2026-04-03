import { headers } from "next/headers";

import { TypedDocumentString } from "@/graphql/graphql";
import { GRAPHQL_BASE_URL } from "@/lib/config/server-env";
import { API_CONSTANTS, HEADERS } from "@/lib/constants/api";
import { StoreCode } from "@/lib/constants/i18n";
import { createTimeoutError, isTimeoutError } from "@/lib/utils/network-error";

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
  query: TypedDocumentString<TResult, TVariables>;
  requestInit?: RequestInit;
  skipUserAgentHeader?: boolean;
  storeCode?: StoreCode;
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

export async function graphqlRequest<
  TResult,
  TVariables = Record<string, never>,
>({
  authToken,
  query,
  requestInit,
  skipUserAgentHeader,
  storeCode,
  variables,
}: GraphqlRequestParams<TResult, TVariables>): Promise<
  GraphQLResponse<TResult>
> {
  const serializedQuery =
    typeof query === "string"
      ? query
      : query instanceof String
        ? query.valueOf()
        : (query as { toString(): string }).toString();

  const requestHeaders = new Headers();

  requestHeaders.set(HEADERS.ACCEPT, "application/json");
  requestHeaders.set(HEADERS.CONTENT_TYPE, "application/json");
  requestHeaders.set(HEADERS.X_PLATFORM, "web");

  if (!skipUserAgentHeader) {
    const nextHeaders = await headers();
    const userAgent = nextHeaders.get("user-agent");
    if (userAgent) {
      requestHeaders.set(HEADERS.USER_AGENT, userAgent);
    }
  }

  if (storeCode) {
    requestHeaders.set(HEADERS.STORE, storeCode);
  }
  if (authToken) {
    requestHeaders.set(HEADERS.AUTHORIZATION, `Bearer ${authToken}`);
  }

  try {
    const response = await fetch(GRAPHQL_BASE_URL, {
      body: JSON.stringify({
        query: serializedQuery,
        ...(variables ? { variables } : {}),
      }),
      headers: requestHeaders,
      method: "POST",
      signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
      ...requestInit,
    });

    // Log the request for debugging
    if (serializedQuery.includes("getKsaAddress")) {
      console.info("[graphqlRequest] KSA Address Request:", {
        headers: {
          accept: requestHeaders.get(HEADERS.ACCEPT),
          contentType: requestHeaders.get(HEADERS.CONTENT_TYPE),
          store: requestHeaders.get(HEADERS.STORE),
        },
        query: serializedQuery.substring(0, 200),
        url: GRAPHQL_BASE_URL,
        variables,
      });
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 503) {
        throw new Error(`GraphQL Service Unavailable: ${response.statusText}`);
      }
      if (response.status >= 500) {
        throw new Error(
          `GraphQL Server Error: ${response.status} ${response.statusText}`
        );
      }
      if (response.status === 404) {
        throw new Error(`GraphQL Endpoint Not Found: ${response.statusText}`);
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Get response as text first to validate it's JSON
    const responseText = await response.text();

    // Check if response looks like PHP array output
    if (responseText.trim().startsWith("Array(")) {
      console.error(
        "[graphqlRequest] Received PHP array output instead of JSON:",
        responseText.substring(0, 200)
      );
      throw new Error(
        "Invalid response format: Backend returned PHP array output instead of JSON"
      );
    }

    // Try to parse as JSON
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error(
        "[graphqlRequest] Failed to parse response as JSON:",
        parseError,
        "Response preview:",
        responseText.substring(0, 500)
      );
      throw new Error(
        `Failed to parse GraphQL response as JSON: ${parseError instanceof Error ? parseError.message : "Unknown error"}`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      if (isTimeoutError(error)) {
        throw createTimeoutError();
      }
      throw error;
    }
    throw new Error("Unknown GraphQL Request Error");
  }
}
