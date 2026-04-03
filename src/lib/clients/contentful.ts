import { createClient } from "contentful";

import {
  CONTENTFUL_ACCESS_TOKEN,
  CONTENTFUL_ENVIRONMENT,
  CONTENTFUL_SPACE_ID,
} from "@/lib/config/server-env";
import { API_CONSTANTS } from "@/lib/constants/api";

// Config type for the fetch adapter (replaces axios config)
type AdapterConfig = {
  data?: unknown;
  headers?: Record<string, string>;
  method?: string;
  params?: Record<string, string>;
  url?: string;
};

// Custom fetch adapter to replace axios and avoid url.parse() deprecation in Node.js 24+
function fetchAdapter(config: AdapterConfig): Promise<unknown> {
  const { data, headers, method = "GET", params, url } = config;

  // Build URL with query params
  let fullUrl = url ?? "";
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    fullUrl = `${fullUrl}?${searchParams.toString()}`;
  }

  return fetch(fullUrl, {
    body: data ? JSON.stringify(data) : undefined,
    headers: headers as Record<string, string>,
    method,
    signal: AbortSignal.timeout(API_CONSTANTS.DEFAULT_TIMEOUT),
  }).then(async (response) => {
    const responseData = await response.json();
    // Return axios-like response structure expected by contentful SDK
    return {
      config,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries()),
      request: response,
      status: response.status,
      statusText: response.statusText,
    };
  });
}

export const contentfulClient = createClient({
  accessToken: CONTENTFUL_ACCESS_TOKEN,
  adapter: fetchAdapter as any,
  environment: CONTENTFUL_ENVIRONMENT,
  space: CONTENTFUL_SPACE_ID,
});
