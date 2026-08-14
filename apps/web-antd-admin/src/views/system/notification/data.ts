import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const channelOptions = () => [
  { label: $t('system.notification.inApp'), value: 'NOTIFICATION_CHANNEL_IN_APP' },
  { label: $t('system.notification.email'), value: 'NOTIFICATION_CHANNEL_EMAIL' },
  { label: $t('system.notification.sms'), value: 'NOTIFICATION_CHANNEL_SMS' },
  { label: 'Webhook', value: 'NOTIFICATION_CHANNEL_WEBHOOK' },
];

export const templateStatusOptions = () => [
  { label: $t('common.enabled'), value: 1 },
  { label: $t('common.disabled'), value: 2 },
];

export const messageStatusOptions = () => [
  { label: $t('system.notification.unread'), value: 'NOTIFICATION_MESSAGE_STATUS_UNREAD' },
  { label: $t('system.notification.read'), value: 'NOTIFICATION_MESSAGE_STATUS_READ' },
  { label: $t('system.notification.archived'), value: 'NOTIFICATION_MESSAGE_STATUS_ARCHIVED' },
];

export const templateSearchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'keyword', label: $t('system.notification.keyword') },
  { component: 'Select', componentProps: { allowClear: true, options: channelOptions() }, fieldName: 'channel', label: $t('system.notification.channel') },
  { component: 'Select', componentProps: { allowClear: true, options: templateStatusOptions() }, fieldName: 'status', label: $t('system.notification.status') },
];

export const messageSearchSchema = (): VbenFormSchema[] => [
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 1 }, fieldName: 'recipientUserId', label: $t('system.notification.recipientUserId') },
  { component: 'Select', componentProps: { allowClear: true, options: messageStatusOptions() }, fieldName: 'status', label: $t('system.notification.messageStatus') },
  { component: 'Input', fieldName: 'businessType', label: $t('system.notification.businessType') },
];

export const templateFormSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'code', label: $t('system.notification.code'), rules: 'required' },
  { component: 'Input', fieldName: 'name', label: $t('system.notification.templateName'), rules: 'required' },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: channelOptions() }, defaultValue: 'NOTIFICATION_CHANNEL_IN_APP', fieldName: 'channel', label: $t('system.notification.channel') },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: templateStatusOptions() }, defaultValue: 1, fieldName: 'status', label: $t('system.notification.status') },
  { component: 'Input', fieldName: 'title', label: $t('system.notification.messageTitle'), rules: 'required' },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 8, minRows: 4 } }, fieldName: 'content', label: $t('system.notification.content'), rules: 'required' },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 5, minRows: 2 } }, fieldName: 'variableSchema', label: $t('system.notification.variableSchema') },
  { component: 'Input', defaultValue: 'zh-CN', fieldName: 'locale', label: $t('system.notification.locale') },
  { component: 'Textarea', fieldName: 'remark', label: $t('system.notification.remark') },
];

const isSendChannel = (channel: string) => (values: Record<string, any>) =>
  values.channel === channel;

const showWhen = (condition: (values: Record<string, any>) => boolean) => ({
  show: condition,
  triggerFields: ['channel'],
});

export const sendFormSchema = (): VbenFormSchema[] => [
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: [
    { label: $t('system.notification.inApp'), value: 'NOTIFICATION_CHANNEL_IN_APP' },
    { label: $t('system.notification.sms'), value: 'NOTIFICATION_CHANNEL_SMS' },
  ] }, defaultValue: 'NOTIFICATION_CHANNEL_IN_APP', fieldName: 'channel', label: $t('system.notification.channel') },
  { component: 'Input', dependencies: showWhen(isSendChannel('NOTIFICATION_CHANNEL_IN_APP')), fieldName: 'recipientUserIdsText', label: $t('system.notification.recipientUserIds'), rules: 'required' },
  { component: 'Input', dependencies: showWhen(isSendChannel('NOTIFICATION_CHANNEL_SMS')), fieldName: 'phonesText', label: $t('system.notification.phones'), rules: 'required' },
  { component: 'Input', fieldName: 'templateCode', label: $t('system.notification.templateCode') },
  { component: 'Input', fieldName: 'title', label: $t('system.notification.messageTitle') },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 8, minRows: 3 } }, fieldName: 'content', label: $t('system.notification.content') },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 6, minRows: 2 } }, fieldName: 'variables', label: $t('system.notification.variables') },
  { component: 'InputNumber', componentProps: { class: 'w-full', max: 100, min: -100 }, defaultValue: 0, fieldName: 'priority', label: $t('system.notification.priority') },
  { component: 'Input', fieldName: 'businessType', label: $t('system.notification.businessType') },
  { component: 'Input', fieldName: 'businessId', label: $t('system.notification.businessId') },
];

function channelLabel(value: string) {
  return channelOptions().find((item) => item.value === value)?.label ?? value;
}

function messageStatusLabel(value: string) {
  return messageStatusOptions().find((item) => item.value === value)?.label ?? value;
}

export const templateColumns = (
  onClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] => [
  { field: 'code', minWidth: 180, title: $t('system.notification.code') },
  { field: 'name', minWidth: 180, title: $t('system.notification.templateName') },
  { field: 'channel', formatter: ({ cellValue }) => channelLabel(cellValue), width: 120, title: $t('system.notification.channel') },
  { field: 'title', minWidth: 220, showOverflow: 'tooltip', title: $t('system.notification.messageTitle') },
  { field: 'status', formatter: ({ cellValue }) => templateStatusOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 100, title: $t('system.notification.status') },
  { field: 'updatedAt', width: 180, title: $t('system.notification.updatedAt') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [
    { code: 'edit', text: $t('common.edit') },
    { code: 'delete', text: $t('common.delete') },
  ] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.notification.operation'), width: 160 },
];

export const messageColumns = (): VxeTableGridOptions['columns'] => [
  { field: 'id', width: 90, title: 'ID' },
  { field: 'recipientUserId', width: 130, title: $t('system.notification.recipientUserId') },
  { field: 'title', minWidth: 220, showOverflow: 'tooltip', title: $t('system.notification.messageTitle') },
  { field: 'channel', formatter: ({ cellValue }) => channelLabel(cellValue), width: 120, title: $t('system.notification.channel') },
  { field: 'status', formatter: ({ cellValue }) => messageStatusLabel(cellValue), width: 110, title: $t('system.notification.messageStatus') },
  { field: 'businessType', width: 140, title: $t('system.notification.businessType') },
  { field: 'senderName', width: 140, title: $t('system.notification.sender') },
  { field: 'readAt', width: 180, title: $t('system.notification.readAt') },
  { field: 'createdAt', width: 180, title: $t('system.notification.createdAt') },
];
