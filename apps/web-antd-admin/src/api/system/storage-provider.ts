import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace StorageProviderApi {
  export type ProviderType =
    | 'aliyun-oss'
    | 'local'
    | 'qiniu-kodo'
    | 's3-compatible'
    | 'tencent-cos';
  export type HealthStatus = 'healthy' | 'unhealthy' | 'unknown';

  export interface Provider {
    accessKey?: string;
    code: string;
    createdAt?: string;
    defaultBucket?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    healthStatus?: HealthStatus;
    id: number;
    isDefault?: boolean;
    lastCheckedAt?: string;
    localBasePath?: string;
    name: string;
    publicBaseUrl?: string;
    region?: string;
    remark?: string;
    secretConfigured?: boolean;
    secretKey?: string;
    sessionToken?: string;
    status?: number;
    type: ProviderType;
    updatedAt?: string;
    useSsl?: boolean;
  }
}

export const getStorageProviderList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<StorageProviderApi.Provider>>(
    '/storage-providers',
    { params },
  );

export const createStorageProvider = async (
  provider: Partial<StorageProviderApi.Provider>,
) => {
  const result = await requestClient.post<{
    provider: StorageProviderApi.Provider;
  }>('/platform/v1/storage-providers', { provider });
  return result.provider;
};

export const updateStorageProvider = async (
  id: number,
  provider: Partial<StorageProviderApi.Provider>,
) => {
  const result = await requestClient.put<{
    provider: StorageProviderApi.Provider;
  }>(`/platform/v1/storage-providers/${id}`, { provider });
  return result.provider;
};

export const deleteStorageProvider = (id: number) =>
  requestClient.delete(`/platform/v1/storage-providers/${id}`);

export const setDefaultStorageProvider = async (id: number) => {
  const result = await requestClient.post<{
    provider: StorageProviderApi.Provider;
  }>(`/platform/v1/storage-providers/${id}:set-default`, { id });
  return result.provider;
};

export const testStorageProvider = (data: {
  id?: number;
  provider?: Partial<StorageProviderApi.Provider>;
}) =>
  requestClient.post<{ healthy: boolean; message: string }>(
    '/storage-providers:test',
    data,
  );
