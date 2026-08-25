import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'code',
    label: $t('evie.category.code'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('evie.category.name'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 0 },
    defaultValue: 0,
    fieldName: 'sort',
    label: $t('evie.category.sort'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'keyword',
    label: $t('evie.category.name'),
  },
];

export const columns = (): VxeTableGridOptions['columns'] => [
  {
    field: 'code',
    minWidth: 140,
    title: $t('evie.category.code'),
  },
  {
    field: 'name',
    minWidth: 140,
    title: $t('evie.category.name'),
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        textMap: { 1: $t('common.yes'), 0: $t('common.no') },
      },
      name: 'CellTag',
    },
    field: 'builtin',
    title: $t('evie.category.builtin'),
    width: 90,
  },
  {
    align: 'center',
    field: 'sort',
    title: $t('evie.category.sort'),
    width: 80,
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
    width: 150,
  },
];
