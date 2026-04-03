import { STATUS } from "@/lib/constants/service-result";
import {
  ServiceResult,
  ServiceResultError,
  ServiceResultOk,
  ServiceResultUnauthenticated,
} from "@/lib/types/service-result";

export const ok = <T>(data: T): ServiceResultOk<T> => ({
  data,
  status: STATUS.OK,
});

export const unauthenticated = (): ServiceResultUnauthenticated => ({
  data: null,
  status: STATUS.UNAUTHORIZED,
});

export const failure = (errorMessage: string): ServiceResultError => ({
  data: null,
  error: errorMessage,
  status: STATUS.ERROR,
});

export const isOk = <T>(r: ServiceResult<T>): r is ServiceResultOk<T> =>
  r.status === STATUS.OK;

export const isUnauthenticated = <T>(
  r: ServiceResult<T>
): r is ServiceResultUnauthenticated => r.status === STATUS.UNAUTHORIZED;

export const isError = <T>(r: ServiceResult<T>): r is ServiceResultError =>
  r.status === STATUS.ERROR;
