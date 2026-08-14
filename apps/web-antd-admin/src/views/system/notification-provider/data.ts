import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { NotificationProviderApi } from '#/api';

import { $t } from '#/locales';

export const channelOptions = () => [
  { label: $t('system.notification.inApp'), value: 'in-app' },
  { label: $t('system.notification.sms'), value: 'sms' },
  { label: $t('system.notification.push'), value: 'push' },
  { label: $t('system.notification.email'), value: 'email' },
  { label: 'Webhook', value: 'webhook' },
];

// 按渠道联动的提供商选项
const providerTypeByChannel: Record<string, Array<{ label: string; value: string }>> = {
  sms: [
    { label: $t('system.notificationProvider.aliyunSms'), value: 'aliyun-sms' },
    { label: $t('system.notificationProvider.yunpian'), value: 'yunpian' },
  ],
  push: [
    { label: $t('system.notificationProvider.jpush'), value: 'jpush' },
    { label: $t('system.notificationProvider.getui'), value: 'getui' },
  ],
};

export const statusOptions = () => [
  { label: $t('common.enabled'), value: 1 },
  { label: $t('common.disabled'), value: 2 },
];

const isChannel = (...channels: string[]) => (values: Record<string, any>) =>
  channels.includes(values.channel);

const show = (condition: (values: Record<string, any>) => boolean) => ({
  show: condition,
  triggerFields: ['channel'],
});

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'code', label: $t('system.notificationProvider.code') },
  { component: 'Input', fieldName: 'name', label: $t('system.notificationProvider.name') },
  { component: 'Select', componentProps: { allowClear: true, options: channelOptions() }, fieldName: 'channel', label: $t('system.notification.channel') },
  { component: 'Select', componentProps: { allowClear: true, options: statusOptions() }, fieldName: 'status', label: $t('system.notification.status') },
];

export const formSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'code', label: $t('system.notificationProvider.code'), rules: 'required' },
  { component: 'Input', fieldName: 'name', label: $t('system.notificationProvider.name'), rules: 'required' },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: channelOptions() }, defaultValue: 'sms', fieldName: 'channel', label: $t('system.notification.channel'), rules: 'required' },
  { component: 'Select', componentProps: { allowClear: true, options: providerTypeByChannel.sms }, dependencies: { componentProps: (values) => ({ options: providerTypeByChannel[values.channel] ?? [] }), triggerFields: ['channel'] }, fieldName: 'providerType', label: $t('system.notificationProvider.providerType') },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: statusOptions() }, defaultValue: 1, fieldName: 'status', label: $t('system.notification.status') },
  { component: 'Switch', defaultValue: false, fieldName: 'isDefault', label: $t('system.notificationProvider.isDefault') },
  { component: 'Input', dependencies: show(isChannel('sms')), fieldName: 'endpoint', label: $t('system.notificationProvider.endpoint') },
  { component: 'Input', dependencies: show(isChannel('sms')), fieldName: 'accessKeyId', label: $t('system.notificationProvider.accessKeyId') },
  { component: 'InputPassword', dependencies: show(isChannel('sms')), fieldName: 'accessKeySecret', label: $t('system.notificationProvider.accessKeySecret') },
  { component: 'Input', dependencies: show(isChannel('sms')), fieldName: 'signName', label: $t('system.notificationProvider.signName') },
  { component: 'Input', dependencies: show(isChannel('sms')), fieldName: 'templateCode', label: $t('system.notificationProvider.templateCode') },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 4, minRows: 2 } }, fieldName: 'remark', label: $t('system.notification.remark') },
];

export const columns = (
  onClick: OnActionClickFn<NotificationProviderApi.Provider>,
): VxeTableGridOptions['columns'] => [
  { field: 'code', minWidth: 150, title: $t('system.notificationProvider.code') },
  { field: 'name', minWidth: 160, title: $t('system.notificationProvider.name') },
  { field: 'channel', formatter: ({ cellValue }) => channelOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 120, title: $t('system.notification.channel') },
  { field: 'isDefault', formatter: ({ cellValue }) => cellValue ? $t('common.yes') : $t('common.no'), width: 90, title: $t('system.notificationProvider.isDefault') },
  { field: 'status', formatter: ({ cellValue }) => statusOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 90, title: $t('system.notification.status') },
  { field: 'updatedAt', minWidth: 170, title: $t('system.notificationProvider.updatedAt') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [
    { code: 'edit', text: $t('common.edit') },
    { code: 'test', text: $t('system.notificationProvider.test') },
    { code: 'default', text: $t('system.notificationProvider.setDefault') },
    { code: 'delete', danger: true, text: $t('common.delete') },
  ] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.notification.operation'), width: 260 },
];
