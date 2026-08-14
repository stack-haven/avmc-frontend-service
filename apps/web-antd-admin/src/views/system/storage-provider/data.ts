import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { StorageProviderApi } from '#/api';

import { $t } from '#/locales';

export const providerTypeOptions = () => [
  { label: $t('system.storageProvider.s3Compatible'), value: 's3-compatible' },
  { label: $t('system.storageProvider.local'), value: 'local' },
  { label: $t('system.storageProvider.aliyunOss'), value: 'aliyun-oss' },
  { label: $t('system.storageProvider.qiniuKodo'), value: 'qiniu-kodo' },
  { label: $t('system.storageProvider.tencentCos'), value: 'tencent-cos' },
];

export const statusOptions = () => [
  { label: $t('common.enabled'), value: 1 },
  { label: $t('common.disabled'), value: 2 },
];

export const healthOptions = () => [
  { label: $t('system.storageProvider.healthy'), value: 'healthy' },
  { label: $t('system.storageProvider.unhealthy'), value: 'unhealthy' },
  { label: $t('system.storageProvider.unknown'), value: 'unknown' },
];

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'code', label: $t('system.storageProvider.code') },
  { component: 'Input', fieldName: 'name', label: $t('system.storageProvider.providerName') },
  { component: 'Select', componentProps: { allowClear: true, options: providerTypeOptions() }, fieldName: 'type', label: $t('system.storageProvider.type') },
  { component: 'Select', componentProps: { allowClear: true, options: statusOptions() }, fieldName: 'status', label: $t('system.storageProvider.status') },
];

const isType = (...types: string[]) => (values: Record<string, any>) =>
  types.includes(values.type);

const notLocal = (values: Record<string, any>) => values.type !== 'local';

const show = (
  condition: (values: Record<string, any>) => boolean,
) => ({
  show: condition,
  triggerFields: ['type'],
});

export const formSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'code', label: $t('system.storageProvider.code'), rules: 'required' },
  { component: 'Input', fieldName: 'name', label: $t('system.storageProvider.providerName'), rules: 'required' },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: providerTypeOptions() }, defaultValue: 'local', fieldName: 'type', label: $t('system.storageProvider.type'), rules: 'required' },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: statusOptions() }, defaultValue: 1, fieldName: 'status', label: $t('system.storageProvider.status') },
  { component: 'Switch', defaultValue: false, fieldName: 'isDefault', label: $t('system.storageProvider.isDefault') },
  { component: 'Input', defaultValue: 'tenant-files', fieldName: 'defaultBucket', label: $t('system.storageProvider.defaultBucket') },
  { component: 'Input', dependencies: show(isType('s3-compatible', 'aliyun-oss')), fieldName: 'endpoint', label: $t('system.storageProvider.endpoint') },
  { component: 'Input', dependencies: show(isType('qiniu-kodo', 'tencent-cos')), fieldName: 'region', label: $t('system.storageProvider.region') },
  { component: 'Input', dependencies: show(notLocal), fieldName: 'accessKey', label: $t('system.storageProvider.accessKey') },
  { component: 'InputPassword', dependencies: show(notLocal), fieldName: 'secretKey', label: $t('system.storageProvider.secretKey') },
  { component: 'InputPassword', dependencies: show(isType('s3-compatible', 'tencent-cos')), fieldName: 'sessionToken', label: $t('system.storageProvider.sessionToken') },
  { component: 'Switch', dependencies: show(notLocal), defaultValue: false, fieldName: 'useSsl', label: $t('system.storageProvider.useSsl') },
  { component: 'Switch', dependencies: show(isType('s3-compatible')), defaultValue: true, fieldName: 'forcePathStyle', label: $t('system.storageProvider.forcePathStyle') },
  { component: 'Input', dependencies: show(notLocal), fieldName: 'publicBaseUrl', label: $t('system.storageProvider.publicBaseUrl') },
  { component: 'Input', componentProps: { placeholder: './uploads' }, defaultValue: './uploads', dependencies: show(isType('local')), fieldName: 'localBasePath', label: $t('system.storageProvider.localBasePath') },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 5, minRows: 2 } }, fieldName: 'remark', label: $t('system.storageProvider.remark') },
];

export const columns = (
  onClick: OnActionClickFn<StorageProviderApi.Provider>,
): VxeTableGridOptions['columns'] => [
  { field: 'code', minWidth: 180, title: $t('system.storageProvider.code') },
  { field: 'name', minWidth: 180, title: $t('system.storageProvider.providerName') },
  { field: 'type', formatter: ({ cellValue }) => providerTypeOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 150, title: $t('system.storageProvider.type') },
  { field: 'defaultBucket', minWidth: 140, title: $t('system.storageProvider.defaultBucket') },
  { field: 'isDefault', formatter: ({ cellValue }) => cellValue ? $t('common.yes') : $t('common.no'), width: 110, title: $t('system.storageProvider.isDefault') },
  { field: 'healthStatus', formatter: ({ cellValue }) => healthOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 110, title: $t('system.storageProvider.healthStatus') },
  { field: 'status', formatter: ({ cellValue }) => statusOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 90, title: $t('system.storageProvider.status') },
  { field: 'updatedAt', minWidth: 170, title: $t('system.storageProvider.updatedAt') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [
    { code: 'edit', text: $t('common.edit') },
    { code: 'test', text: $t('system.storageProvider.test') },
    { code: 'default', text: $t('system.storageProvider.setDefault') },
    { code: 'delete', text: $t('common.delete') },
  ] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.storageProvider.operation'), width: 250 },
];
