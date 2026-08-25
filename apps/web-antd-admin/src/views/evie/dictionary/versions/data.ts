import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const columns = (): VxeTableGridOptions['columns'] => [
  {
    align: 'center',
    field: 'versionNo',
    title: $t('evie.version.versionNo'),
    width: 100,
  },
  {
    field: 'description',
    minWidth: 160,
    title: $t('evie.version.description'),
  },
  {
    field: 'snapshot',
    formatter: ({ row }) => truncate(row.snapshot, 60),
    minWidth: 200,
    title: $t('evie.dictionary.snapshot'),
  },
  {
    align: 'center',
    field: 'status',
    title: $t('evie.version.status'),
    width: 90,
  },
  {
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 170,
  },
  {
    align: 'center',
    field: 'operation',
    fixed: 'right',
    slots: { default: 'operation' },
    title: $t('evie.dictionary.operation'),
    width: 120,
  },
];

function truncate(text?: string, len = 60) {
  if (!text) return '-';
  return text.length > len ? `${text.slice(0, len)}...` : text;
}
