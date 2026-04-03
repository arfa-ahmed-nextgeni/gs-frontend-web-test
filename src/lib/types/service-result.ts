import { STATUS } from "@/lib/constants/service-result";

export type ServiceResult<T> =
  | ServiceResultError
  | ServiceResultOk<T>
  | ServiceResultUnauthenticated;

export type ServiceResultError = {
  data: null;
  error: string;
  status: typeof STATUS.ERROR;
};

export type ServiceResultOk<T> = {
  data: T;
  status: typeof STATUS.OK;
};

export type ServiceResultUnauthenticated = {
  data: null;
  status: typeof STATUS.UNAUTHORIZED;
};

export type Status = (typeof STATUS)[keyof typeof STATUS];
