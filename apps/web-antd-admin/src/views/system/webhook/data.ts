import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { WebhookApi } from '#/api';

import { $t } from '#/locales';

export const eventTypeOptions = () => [
  { label: $t('system.webhook.eventType.fileUploadCompleted'), value: 'WEBHOOK_EVENT_TYPE_FILE_UPLOAD_COMPLETED' },
  { label: $t('system.webhook.eventType.resourceQuotaExceeded'), value: 'WEBHOOK_EVENT_TYPE_RESOURCE_QUOTA_EXCEEDED' },
  { label: $t('system.webhook.eventType.asyncTaskFailed'), value: 'WEBHOOK_EVENT_TYPE_ASYNC_TASK_FAILED' },
  { label: $t('system.webhook.eventType.tenantCreated'), value: 'WEBHOOK_EVENT_TYPE_TENANT_CREATED' },
  { label: $t('system.webhook.eventType.userCreated'), value: 'WEBHOOK_EVENT_TYPE_USER_CREATED' },
];

export const deliveryStatusOptions = () => [
  { label: $t('system.webhook.deliveryStatus.pending'), value: 'WEBHOOK_DELIVERY_STATUS_PENDING' },
  { label: $t('system.webhook.deliveryStatus.success'), value: 'WEBHOOK_DELIVERY_STATUS_SUCCESS' },
  { label: $t('system.webhook.deliveryStatus.failed'), value: 'WEBHOOK_DELIVERY_STATUS_FAILED' },
];

export const statusOptions = () => [
  { label: $t('common.enabled'), value: 1 },
  { label: $t('common.disabled'), value: 2 },
];

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'keyword', label: $t('system.webhook.keyword') },
  { component: 'Select', componentProps: { allowClear: true, options: statusOptions() }, fieldName: 'status', label: $t('system.webhook.status') },
];

export const formSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'name', label: $t('system.webhook.name'), rules: 'required' },
  { component: 'Input', fieldName: 'url', label: $t('system.webhook.url'), rules: 'required' },
  { component: 'InputPassword', fieldName: 'secret', label: $t('system.webhook.secret'), rules: 'required' },
  { component: 'Select', componentProps: { mode: 'multiple', options: eventTypeOptions() }, defaultValue: [], fieldName: 'eventTypes', label: $t('system.webhook.eventTypes'), rules: 'required' },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: statusOptions() }, defaultValue: 1, fieldName: 'status', label: $t('system.webhook.status') },
];

export const columns = (onClick: OnActionClickFn<WebhookApi.Subscription>): VxeTableGridOptions['columns'] => [
  { field: 'name', minWidth: 160, title: $t('system.webhook.name') },
  { field: 'url', minWidth: 280, title: $t('system.webhook.url') },
  { field: 'eventTypes', formatter: ({ cellValue }) => (cellValue as string[])?.map(v => eventTypeOptions().find(o => o.value === v)?.label ?? v).join(', ') ?? '', minWidth: 240, title: $t('system.webhook.eventTypes') },
  { field: 'status', formatter: ({ cellValue }) => statusOptions().find(o => o.value === cellValue)?.label ?? cellValue, width: 80, title: $t('system.webhook.status') },
  { field: 'updatedAt', minWidth: 170, title: $t('system.webhook.updatedAt') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [
    { code: 'edit', text: $t('common.edit') },
    { code: 'logs', text: $t('system.webhook.deliveryLogs') },
    { code: 'delete', text: $t('common.delete') },
  ] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.webhook.operation'), width: 230 },
];

export const deliveryLogColumns: VxeTableGridOptions['columns'] = [
  { field: 'eventId', minWidth: 200, title: $t('system.webhook.eventId') },
  { field: 'eventType', formatter: ({ cellValue }) => eventTypeOptions().find(o => o.value === cellValue)?.label ?? cellValue, width: 160, title: $t('system.webhook.eventType.title') },
  { field: 'targetUrl', minWidth: 280, title: $t('system.webhook.targetUrl') },
  { field: 'responseCode', width: 100, title: $t('system.webhook.responseCode') },
  { field: 'deliveryStatus', formatter: ({ cellValue }) => deliveryStatusOptions().find(o => o.value === cellValue)?.label ?? cellValue, width: 100, title: $t('system.webhook.deliveryStatus.title') },
  { field: 'attemptNumber', width: 90, title: $t('system.webhook.attemptNumber') },
  { field: 'errorMessage', minWidth: 200, title: $t('system.webhook.errorMessage') },
  { field: 'createdAt', minWidth: 170, title: $t('system.webhook.createdAt') },
];
