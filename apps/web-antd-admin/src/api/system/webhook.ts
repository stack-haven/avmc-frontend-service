import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type { ApiType } from '../type';

export namespace WebhookApi {
  export type EventType =
    | 'WEBHOOK_EVENT_TYPE_UNSPECIFIED'
    | 'WEBHOOK_EVENT_TYPE_FILE_UPLOAD_COMPLETED'
    | 'WEBHOOK_EVENT_TYPE_RESOURCE_QUOTA_EXCEEDED'
    | 'WEBHOOK_EVENT_TYPE_ASYNC_TASK_FAILED'
    | 'WEBHOOK_EVENT_TYPE_TENANT_CREATED'
    | 'WEBHOOK_EVENT_TYPE_USER_CREATED';

  export type DeliveryStatus =
    | 'WEBHOOK_DELIVERY_STATUS_UNSPECIFIED'
    | 'WEBHOOK_DELIVERY_STATUS_PENDING'
    | 'WEBHOOK_DELIVERY_STATUS_SUCCESS'
    | 'WEBHOOK_DELIVERY_STATUS_FAILED';

  export interface Subscription {
    id: number;
    tenantId?: number;
    name: string;
    url: string;
    secret: string;
    eventTypes: EventType[];
    status?: number;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface DeliveryLog {
    id: number;
    tenantId: number;
    subscriptionId: number;
    eventId: string;
    eventType: EventType;
    targetUrl: string;
    requestBody: string;
    responseCode?: number;
    responseBody?: string;
    deliveryStatus: DeliveryStatus;
    attemptNumber: number;
    errorMessage?: string;
    createdAt?: string;
  }
}

// Subscription management
export const getWebhookSubscriptionList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<WebhookApi.Subscription>>(
    '/webhook-subscriptions',
    { params },
  );

export const getWebhookSubscription = (id: number) =>
  requestClient.get<WebhookApi.Subscription>(`/webhook-subscriptions/${id}`);

export const createWebhookSubscription = (
  data: Omit<WebhookApi.Subscription, 'createdAt' | 'id' | 'updatedAt'>,
) => requestClient.post<WebhookApi.Subscription>('/webhook-subscriptions', { subscription: data });

export const updateWebhookSubscription = (
  id: number,
  data: Omit<WebhookApi.Subscription, 'createdAt' | 'id' | 'updatedAt'>,
) =>
  requestClient.put<WebhookApi.Subscription>(
    `/webhook-subscriptions/${id}`,
    { subscription: data },
  );

export const deleteWebhookSubscription = (id: number) =>
  requestClient.delete(`/webhook-subscriptions/${id}`);

// Delivery log management
export const getWebhookDeliveryLogList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<WebhookApi.DeliveryLog>>(
    '/webhook-delivery-logs',
    { params },
  );

export const getWebhookDeliveryLog = (id: number) =>
  requestClient.get<WebhookApi.DeliveryLog>(`/webhook-delivery-logs/${id}`);

export const retryWebhookDelivery = (id: number) =>
  requestClient.post<{ newDeliveryLogId: number }>(
    `/webhook-delivery-logs/${id}:retry`,
  );
