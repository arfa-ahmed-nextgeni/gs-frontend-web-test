import type {
  ApiActivityFeature,
  ApiActivityService,
} from "@/lib/api-activity/api-activity-meta";

export type ApiActivityBody = {
  contentType: null | string;
  note: null | string;
  preview: null | string;
  previewSize: null | number;
  totalSize: null | number;
  truncated: boolean;
};

export type ApiActivityEntry = {
  action: null | string;
  durationMs: number;
  endedAt: string;
  error: ApiActivityError | null;
  feature: ApiActivityFeature | null;
  id: string;
  initiator: string;
  request: ApiActivityRequest;
  response: ApiActivityResponse | null;
  service: ApiActivityService;
  startedAt: string;
  target: string;
};

export type ApiActivityEntrySummary = {
  action: null | string;
  durationMs: number;
  endedAt: string;
  feature: ApiActivityFeature | null;
  hasError: boolean;
  id: string;
  method: string;
  service: ApiActivityService;
  startedAt: string;
  status: null | number;
  target: string;
};

export type ApiActivityError = {
  message: string;
  name: string;
};

export type ApiActivityHeader = {
  name: string;
  value: string;
};

export type ApiActivityQueryParam = {
  key: string;
  value: string;
};

export type ApiActivityRequest = {
  body: ApiActivityBody | null;
  headers: ApiActivityHeader[];
  method: string;
  origin: null | string;
  pathname: string;
  query: ApiActivityQueryParam[];
  url: string;
};

export type ApiActivityResponse = {
  body: ApiActivityBody | null;
  headers: ApiActivityHeader[];
  redirected: boolean;
  status: number;
  statusText: string;
  url: string;
};
