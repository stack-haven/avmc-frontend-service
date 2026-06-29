import type { Recordable } from '@vben/types';
import type { ApiType } from '../type';
import { requestClient } from '#/api/request';

export namespace SystemSessionApi {
  export interface Session {
    id: string;
    tenantId: number;
    userId: number;
    username: string;
    ip?: string;
    userAgent?: string;
    current: boolean;
    createdAt?: string;
    lastActiveAt?: string;
    expiresAt?: string;
  }
}

export const getSessionList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemSessionApi.Session>>(
    '/sessions',
    { params },
  );

export const getMySessions = () =>
  requestClient.get<{ items: SystemSessionApi.Session[] }>('/sessions/mine');

export const revokeSession = (id: string) =>
  requestClient.delete(`/sessions/${id}`);

