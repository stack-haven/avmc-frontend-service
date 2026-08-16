import type { Recordable } from '@vben/types';
import type { ApiType } from '../type';
import { requestClient } from '#/api/request';

export namespace SystemOperationLogApi {
  export interface OperationLog {
    id: string;
    operatorName?: string;
    module: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    method?: string;
    path?: string;
    ip?: string;
    traceId?: string;
    success: boolean;
    durationMs?: number;
    errorMessage?: string;
    createdAt?: string;
  }
}
export const getOperationLogList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemOperationLogApi.OperationLog>>('/platform/v1/operation-logs', { params });
export const getOperationLog = (id: string) =>
  requestClient.get<SystemOperationLogApi.OperationLog>(`/platform/v1/operation-logs/${id}`);

