import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import { $t } from '#/locales';

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'username', label: $t('system.session.username') },
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 1 }, fieldName: 'userId', label: $t('system.session.userId') },
  { component: 'Input', fieldName: 'ip', label: 'IP' },
];

export const columns = (onClick: OnActionClickFn<any>): VxeTableGridOptions['columns'] => [
  { field: 'username', minWidth: 140, title: $t('system.session.username') },
  { field: 'userId', width: 100, title: $t('system.session.userId') },
  {
    field: 'current',
    formatter: ({ cellValue }) => cellValue ? $t('system.session.current') : '-',
    width: 100,
    title: $t('system.session.sessionStatus'),
  },
  { field: 'ip', width: 150, title: 'IP' },
  { field: 'userAgent', minWidth: 240, showOverflow: 'tooltip', title: 'User-Agent' },
  { field: 'createdAt', width: 180, title: $t('system.session.createdAt') },
  { field: 'lastActiveAt', width: 180, title: $t('system.session.lastActiveAt') },
  { field: 'expiresAt', width: 180, title: $t('system.session.expiresAt') },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'username',
        onClick,
        options: [{ code: 'revoke', text: $t('system.session.revoke') }],
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('system.session.operation'),
    width: 130,
  },
];

