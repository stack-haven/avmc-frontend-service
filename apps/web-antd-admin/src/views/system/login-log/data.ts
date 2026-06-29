import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { $t } from '#/locales';

const resultOptions = () => [
  { label: $t('system.loginLog.success'), value: 'success' },
  { label: $t('system.loginLog.failure'), value: 'failure' },
  { label: $t('system.loginLog.locked'), value: 'locked' },
];

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'identity', label: $t('system.loginLog.identity') },
  { component: 'Select', componentProps: { allowClear: true, options: resultOptions() }, fieldName: 'result', label: $t('system.loginLog.result') },
  { component: 'Input', fieldName: 'ip', label: 'IP' },
];

export const columns: VxeTableGridOptions['columns'] = [
  { field: 'identity', minWidth: 160, title: $t('system.loginLog.identity') },
  { field: 'loginType', width: 110, title: $t('system.loginLog.loginType') },
  {
    field: 'result',
    formatter: ({ cellValue }) => resultOptions().find((item) => item.value === cellValue)?.label ?? cellValue,
    width: 100,
    title: $t('system.loginLog.result'),
  },
  { field: 'failureReason', minWidth: 200, showOverflow: 'tooltip', title: $t('system.loginLog.failureReason') },
  { field: 'ip', width: 150, title: 'IP' },
  { field: 'userAgent', minWidth: 220, showOverflow: 'tooltip', title: 'User-Agent' },
  { field: 'traceId', minWidth: 190, showOverflow: 'tooltip', title: 'Trace ID' },
  { field: 'createdAt', width: 180, title: $t('system.loginLog.createTime') },
];

