import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { $t } from '#/locales';
export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'module', label: $t('system.operationLog.module') },
  { component: 'Input', fieldName: 'action', label: $t('system.operationLog.action') },
  { component: 'Select', componentProps: { allowClear: true, options: [{ label: $t('system.operationLog.success'), value: true }, { label: $t('system.operationLog.failed'), value: false }] }, fieldName: 'success', label: $t('system.operationLog.result') },
  { component: 'Input', fieldName: 'traceId', label: 'Trace ID' },
];
export const columns: VxeTableGridOptions['columns'] = [
  { field: 'operatorName', minWidth: 130, title: $t('system.operationLog.operator') },
  { field: 'module', minWidth: 120, title: $t('system.operationLog.module') },
  { field: 'action', minWidth: 120, title: $t('system.operationLog.action') },
  { field: 'resourceType', minWidth: 120, title: $t('system.operationLog.resource') },
  { field: 'method', width: 90, title: $t('system.operationLog.method') },
  { field: 'path', minWidth: 220, showOverflow: 'tooltip', title: $t('system.operationLog.path') },
  { field: 'success', formatter: ({ cellValue }) => cellValue ? $t('system.operationLog.success') : $t('system.operationLog.failed'), width: 100, title: $t('system.operationLog.result') },
  { field: 'durationMs', width: 100, title: $t('system.operationLog.duration') },
  { field: 'ip', width: 150, title: 'IP' },
  { field: 'createdAt', width: 180, title: $t('system.operationLog.createTime') },
];
