import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type { ApiType } from '../type';

export namespace NotificationApi {
  export type Channel =
    | 'NOTIFICATION_CHANNEL_EMAIL'
    | 'NOTIFICATION_CHANNEL_IN_APP'
    | 'NOTIFICATION_CHANNEL_SMS'
    | 'NOTIFICATION_CHANNEL_WEBHOOK';

  export type MessageStatus =
    | 'NOTIFICATION_MESSAGE_STATUS_ARCHIVED'
    | 'NOTIFICATION_MESSAGE_STATUS_READ'
    | 'NOTIFICATION_MESSAGE_STATUS_UNREAD';

  export interface Template {
    id: number;
    tenantId?: number;
    code: string;
    name: string;
    channel: Channel;
    title: string;
    content: string;
    variableSchema?: string;
    locale?: string;
    status?: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface Message {
    id: number;
    tenantId: number;
    recipientUserId: number;
    templateId?: number;
    templateCode?: string;
    channel: Channel;
    title: string;
    content: string;
    status: MessageStatus;
    priority?: number;
    businessType?: string;
    businessId?: string;
    readAt?: string;
    senderUserId?: number;
    senderName?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface SendInAppPayload {
    recipientUserIds: number[];
    templateCode?: string;
    title?: string;
    content?: string;
    variables?: string;
    priority?: number;
    businessType?: string;
    businessId?: string;
    idempotencyKey?: string;
  }

  export interface SendNotificationPayload {
    channel: Channel;
    content?: string;
    phones?: string[];
    recipientUserIds?: number[];
    templateCode?: string;
    title?: string;
    variables?: string;
    priority?: number;
    businessType?: string;
    businessId?: string;
    idempotencyKey?: string;
  }
}

export const getNotificationTemplateList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<NotificationApi.Template>>(
    '/notification-templates',
    { params },
  );

export const createNotificationTemplate = (
  data: Omit<NotificationApi.Template, 'createdAt' | 'id' | 'updatedAt'>,
) => requestClient.post<NotificationApi.Template>('/platform/v1/notification-templates', data);

export const updateNotificationTemplate = (
  id: number,
  data: Omit<NotificationApi.Template, 'createdAt' | 'id' | 'updatedAt'>,
) =>
  requestClient.put<NotificationApi.Template>(
    `/notification-templates/${id}`,
    data,
  );

export const deleteNotificationTemplate = (id: number) =>
  requestClient.delete(`/platform/v1/notification-templates/${id}`);

export const sendInAppNotification = (data: NotificationApi.SendInAppPayload) =>
  requestClient.post<{ taskId: number }>('/platform/v1/notifications:send-in-app', data);

export const sendNotification = (data: NotificationApi.SendNotificationPayload) =>
  requestClient.post<{ taskId: number }>('/platform/v1/notifications:send', data);

export const getNotificationMessageList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<NotificationApi.Message>>(
    '/notification-messages',
    { params },
  );

export const getMyNotificationList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<NotificationApi.Message>>(
    '/my/notifications',
    { params },
  );

export const getMyUnreadNotificationCount = () =>
  requestClient.get<{ total: number }>('/platform/v1/my/notifications:unread-count');

export const markNotificationRead = (id: number) =>
  requestClient.post(`/platform/v1/my/notifications/${id}:read`);

export const markNotificationsRead = (ids: number[]) =>
  requestClient.post('/platform/v1/my/notifications:read', { ids });
