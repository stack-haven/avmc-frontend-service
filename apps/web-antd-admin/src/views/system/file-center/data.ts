import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileCenterApi } from '#/api';

import { $t } from '#/locales';

export const fileStatusOptions = () => [
  { label: $t('system.fileCenter.pending'), value: 1 },
  { label: $t('system.fileCenter.confirmed'), value: 2 },
  { label: $t('system.fileCenter.deleted'), value: 3 },
];

export const visibilityOptions = () => [
  { label: $t('system.fileCenter.private'), value: 'private' },
  { label: $t('system.fileCenter.public'), value: 'public' },
];

export const accessActionOptions = () => [
  { label: $t('system.fileCenter.download'), value: 'download' },
  { label: $t('system.fileCenter.preview'), value: 'preview' },
  { label: $t('common.delete'), value: 'delete' },
];

export const searchSchema = () => [
  { component: 'Input', fieldName: 'fileName', label: $t('system.fileCenter.fileName') },
  { component: 'Input', fieldName: 'businessType', label: $t('system.fileCenter.businessType') },
  { component: 'Input', fieldName: 'businessId', label: $t('system.fileCenter.businessId') },
  { component: 'Select', componentProps: { allowClear: true, options: fileStatusOptions() }, fieldName: 'status', label: $t('system.fileCenter.status') },
];

export const columns = (
  onClick: OnActionClickFn<FileCenterApi.FileObject>,
): VxeTableGridOptions['columns'] => [
  { field: 'fileName', minWidth: 220, title: $t('system.fileCenter.fileName') },
  { field: 'contentType', minWidth: 180, title: $t('system.fileCenter.contentType') },
  { field: 'size', formatter: ({ cellValue }) => formatBytes(Number(cellValue || 0)), width: 120, title: $t('system.fileCenter.size') },
  { field: 'businessType', minWidth: 130, title: $t('system.fileCenter.businessType') },
  { field: 'businessId', minWidth: 160, title: $t('system.fileCenter.businessId') },
  { field: 'providerCode', minWidth: 150, title: $t('system.fileCenter.provider') },
  { field: 'visibility', formatter: ({ cellValue }) => visibilityOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 110, title: $t('system.fileCenter.visibility') },
  { field: 'status', formatter: ({ cellValue }) => fileStatusOptions().find((item) => item.value === cellValue)?.label ?? cellValue, width: 110, title: $t('system.fileCenter.status') },
  { field: 'createdAt', minWidth: 170, title: $t('system.fileCenter.createdAt') },
  { align: 'center', cellRender: { attrs: { nameField: 'fileName', onClick }, name: 'CellOperation', options: [
    { code: 'preview', text: $t('system.fileCenter.preview'), show: (row: FileCenterApi.FileObject) => isImage(row) },
    { code: 'download', text: $t('system.fileCenter.download') },
    { code: 'delete', danger: true, text: $t('common.delete') },
    { code: 'accessLog', group: 'more', text: $t('system.fileCenter.accessLogs') },
    { code: 'edit', group: 'more', text: $t('system.fileCenter.edit') },
    { code: 'replace', group: 'more', text: $t('system.fileCenter.replace') },
    { code: 'detail', group: 'more', text: $t('system.fileCenter.detail') },
  ] }, field: 'operation', fixed: 'right', title: $t('system.fileCenter.operation'), width: 220 },
];

export const accessLogColumns = [
  { dataIndex: 'action', key: 'action', title: $t('system.fileCenter.action'), width: 120 },
  { dataIndex: 'result', key: 'result', title: $t('system.fileCenter.result'), width: 120 },
  { dataIndex: 'operatorName', key: 'operatorName', title: $t('system.fileCenter.operator'), width: 140 },
  { dataIndex: 'clientIp', key: 'clientIp', title: $t('system.fileCenter.clientIp'), width: 140 },
  { dataIndex: 'message', key: 'message', title: $t('system.fileCenter.message') },
  { dataIndex: 'createdAt', key: 'createdAt', title: $t('system.fileCenter.createdAt'), width: 180 },
];

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif'];

export function isImage(file: FileCenterApi.FileObject) {
  if (file.contentType?.toLowerCase().startsWith('image/')) return true;
  const ext = (file.fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
  return imageExtensions.includes(ext);
}

export function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = value;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
