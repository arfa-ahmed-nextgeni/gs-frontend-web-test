import { ApiActivityServices } from "@/lib/api-activity/api-activity-meta";

export const API_ACTIVITY_FETCH_ROUTE_PREFIXES = ["/tools/api-activity"];

export const DEFAULT_API_ACTIVITY_FETCH_INITIATOR = "loggedFetch";
export const DEFAULT_API_ACTIVITY_FETCH_SERVICE = ApiActivityServices.Fetch;
export const DEFAULT_API_ACTIVITY_MAX_BODY_BYTES = 32768;

export const API_ACTIVITY_TEXT_CONTENT_TYPE_SNIPPETS = [
  "application/graphql-response+json",
  "application/vnd.contentful.delivery.v1+json",
  "application/graphql",
  "application/json",
  "application/problem+json",
  "application/x-www-form-urlencoded",
  "application/xml",
  "text/",
  "xml",
  "html",
  "javascript",
];
