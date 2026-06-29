import type { Recordable } from '@vben/types';
import type { ApiType } from '../type';
import { requestClient } from '#/api/request';

export namespace SystemLoginLogApi {
  export interface LoginLog {
    id: string;
    tenantId: number;
    userId?: number;
    identity: string;
    loginType: string;
    result: 'failure' | 'locked' | 'success';
    failureReason?: string;
    ip?: string;
    userAgent?: string;
    traceId?: string;
    sessionId?: string;
    createdAt?: string;
  }
}

export const getLoginLogList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemLoginLogApi.LoginLog>>(
    '/login-logs',
    { params },
  );

export const getLoginLog = (id: string) =>
  requestClient.get<SystemLoginLogApi.LoginLog>(`/login-logs/${id}`);

