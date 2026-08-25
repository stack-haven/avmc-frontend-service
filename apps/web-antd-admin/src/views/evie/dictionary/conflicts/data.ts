import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const columns = (): VxeTableGridOptions['columns'] => [
  {
    field: 'input',
    minWidth: 140,
    title: $t('evie.conflict.input'),
  },
  {
    field: 'candidate',
    minWidth: 140,
    title: $t('evie.conflict.candidate'),
  },
  {
    field: 'sourceScope',
    title: $t('evie.conflict.sourceScope'),
    width: 120,
  },
  {
    field: 'sourceDictionary',
    minWidth: 130,
    title: $t('evie.conflict.sourceDictionary'),
  },
  {
    align: 'center',
    field: 'priority',
    title: $t('evie.conflict.priority'),
    width: 100,
  },
  {
    field: 'resolvedCandidate',
    minWidth: 140,
    title: $t('evie.conflict.resolvedCandidate'),
  },
  {
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 170,
  },
];
