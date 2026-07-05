import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';

import { $t } from '#/locales';

const statusOptions = () => [
  {
    label: $t('system.asyncTask.pending'),
    value: 'ASYNC_TASK_STATUS_PENDING',
  },
  {
    label: $t('system.asyncTask.running'),
    value: 'ASYNC_TASK_STATUS_RUNNING',
  },
  {
    label: $t('system.asyncTask.succeeded'),
    value: 'ASYNC_TASK_STATUS_SUCCEEDED',
  },
  {
    label: $t('system.asyncTask.failed'),
    value: 'ASYNC_TASK_STATUS_FAILED',
  },
  {
    label: $t('system.asyncTask.canceled'),
    value: 'ASYNC_TASK_STATUS_CANCELED',
  },
];
export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'taskType',
    label: $t('system.asyncTask.taskType'),
  },
  {
    component: 'Select',
    componentProps: { allowClear: true, options: statusOptions() },
    fieldName: 'status',
    label: $t('system.asyncTask.status'),
  },
  {
    component: 'Input',
    fieldName: 'queue',
    label: $t('system.asyncTask.queue'),
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 1 },
    fieldName: 'tenantId',
    label: $t('system.asyncTask.tenantId'),
  },
];

function statusLabel(value: string) {
  const option = statusOptions().find((item) => item.value === value);
  return option?.label ?? value;
}

export const columns = (
  onClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] => [
  { field: 'id', width: 90, title: 'ID' },
  {
    field: 'taskType',
    minWidth: 220,
    showOverflow: 'tooltip',
    title: $t('system.asyncTask.taskType'),
  },
  { field: 'tenantId', width: 100, title: $t('system.asyncTask.tenantId') },
  { field: 'queue', width: 120, title: $t('system.asyncTask.queue') },
  {
    field: 'status',
    formatter: ({ cellValue }) => statusLabel(cellValue),
    width: 110,
    title: $t('system.asyncTask.status'),
  },
  {
    field: 'attempts',
    formatter: ({ row }) => `${row.attempts}/${row.maxAttempts}`,
    width: 100,
    title: $t('system.asyncTask.attempts'),
  },
  {
    field: 'payloadSummary',
    minWidth: 220,
    showOverflow: 'tooltip',
    title: $t('system.asyncTask.payloadSummary'),
  },
  {
    field: 'resultSummary',
    minWidth: 200,
    showOverflow: 'tooltip',
    title: $t('system.asyncTask.result'),
  },
  {
    field: 'lastError',
    minWidth: 220,
    showOverflow: 'tooltip',
    title: $t('system.asyncTask.lastError'),
  },
  {
    field: 'scheduledAt',
    width: 180,
    title: $t('system.asyncTask.scheduledAt'),
  },
  {
    field: 'completedAt',
    width: 180,
    title: $t('system.asyncTask.completedAt'),
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        onClick,
        options: [
          {
            code: 'cancel',
            danger: true,
            show: (row: any) => row.status === 'ASYNC_TASK_STATUS_PENDING',
            text: $t('system.asyncTask.cancel'),
          },
          {
            code: 'retry',
            show: (row: any) => row.status === 'ASYNC_TASK_STATUS_FAILED',
            text: $t('system.asyncTask.retry'),
          },
        ],
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('system.asyncTask.operation'),
    width: 140,
  },
];
