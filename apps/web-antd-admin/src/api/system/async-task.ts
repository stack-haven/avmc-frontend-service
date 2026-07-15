import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type { ApiType } from '../type';

export namespace SystemAsyncTaskApi {
  export type TaskStatus =
    | 'ASYNC_TASK_STATUS_CANCELED'
    | 'ASYNC_TASK_STATUS_FAILED'
    | 'ASYNC_TASK_STATUS_PENDING'
    | 'ASYNC_TASK_STATUS_RUNNING'
    | 'ASYNC_TASK_STATUS_SUCCEEDED';

  export type TaskHealthStatus =
    | 'ASYNC_TASK_HEALTH_STATUS_CRITICAL'
    | 'ASYNC_TASK_HEALTH_STATUS_HEALTHY'
    | 'ASYNC_TASK_HEALTH_STATUS_UNSPECIFIED'
    | 'ASYNC_TASK_HEALTH_STATUS_WARNING';

  export interface AsyncTask {
    id: number;
    tenantId?: number;
    taskType: string;
    queue: string;
    status: TaskStatus;
    priority: number;
    attempts: number;
    maxAttempts: number;
    idempotencyKey?: string;
    payloadSummary?: string;
    resultSummary?: string;
    lastError?: string;
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
    leaseOwner?: string;
    leaseExpiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface AsyncTaskStatusCount {
    status: TaskStatus;
    count: number;
  }

  export interface AsyncTaskHealthAlert {
    code: string;
    status: TaskHealthStatus;
    count: number;
  }

  export interface AsyncTaskStats {
    statusCounts: AsyncTaskStatusCount[];
    total: number;
    pendingOverdue: number;
    runningLeaseExpired: number;
    failed: number;
    retryPressure: number;
    checkedAt?: string;
    healthStatus: TaskHealthStatus;
    alerts: AsyncTaskHealthAlert[];
  }
}

export const getAsyncTaskList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemAsyncTaskApi.AsyncTask>>(
    '/async-tasks',
    { params },
  );

export const getAsyncTaskStats = (params?: Recordable<any>) =>
  requestClient.get<{ stats: SystemAsyncTaskApi.AsyncTaskStats }>(
    '/async-tasks:stats',
    { params },
  );

export const getAsyncTask = (id: number) =>
  requestClient.get<{ task: SystemAsyncTaskApi.AsyncTask }>(
    `/async-tasks/${id}`,
  );

export const cancelAsyncTask = (id: number) =>
  requestClient.post(`/async-tasks/${id}:cancel`);

export const retryAsyncTask = (id: number) =>
  requestClient.post<{ task: SystemAsyncTaskApi.AsyncTask }>(
    `/async-tasks/${id}:retry`,
  );
