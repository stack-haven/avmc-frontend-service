import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace NotificationProviderApi {
  export type Channel = 'email' | 'in-app' | 'push' | 'sms' | 'webhook';

  export type ProviderType =
    | 'aliyun-sms'
    | 'getui'
    | 'jpush'
    | 'yunpian';

  export interface Provider {
    accessKeyId?: string;
    accessKeySecret?: string;
    channel: Channel;
    code: string;
    createdAt?: string;
    endpoint?: string;
    id: number;
    isDefault?: boolean;
    name: string;
    providerType?: ProviderType;
    remark?: string;
    secretConfigured?: boolean;
    signName?: string;
    status?: number;
    templateCode?: string;
    updatedAt?: string;
  }
}

export const getNotificationProviderList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<NotificationProviderApi.Provider>>(
    '/notification-providers',
    { params },
  );

export const createNotificationProvider = async (
  provider: Partial<NotificationProviderApi.Provider>,
) => {
  const result = await requestClient.post<{
    provider: NotificationProviderApi.Provider;
  }>('/platform/v1/notification-providers', { provider });
  return result.provider;
};

export const updateNotificationProvider = async (
  id: number,
  provider: Partial<NotificationProviderApi.Provider>,
) => {
  const result = await requestClient.put<{
    provider: NotificationProviderApi.Provider;
  }>(`/platform/v1/notification-providers/${id}`, { provider });
  return result.provider;
};

export const deleteNotificationProvider = (id: number) =>
  requestClient.delete(`/platform/v1/notification-providers/${id}`);

export const setDefaultNotificationProvider = async (id: number) => {
  const result = await requestClient.post<{
    provider: NotificationProviderApi.Provider;
  }>(`/platform/v1/notification-providers/${id}:set-default`, { id });
  return result.provider;
};

export const testNotificationProvider = (id: number, phone?: string) =>
  requestClient.post<{ healthy: boolean; message: string }>(
    `/notification-providers/${id}:test`,
    { phone },
  );
