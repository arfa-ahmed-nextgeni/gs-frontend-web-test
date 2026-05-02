import type {
  ApiActivityFeature,
  ApiActivityService,
} from "@/lib/api-activity/api-activity-meta";

export type LoggedFetchLegacyArgs = {
  init?: RequestInit;
  input: RequestInfo | URL;
} & LoggedFetchMeta;

export type LoggedFetchMeta = {
  action?: string;
  feature?: ApiActivityFeature;
  initiator?: string;
  service?: ApiActivityService;
};

export type NormalizedLoggedFetchArgs = {
  init?: RequestInit;
  input: RequestInfo | URL;
  meta: LoggedFetchMeta;
};
