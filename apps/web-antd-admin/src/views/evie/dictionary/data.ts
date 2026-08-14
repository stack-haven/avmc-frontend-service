import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

const categoryOptions = [
  { label: 'person', value: 'person' },
  { label: 'org', value: 'org' },
  { label: 'product', value: 'product' },
  { label: 'term', value: 'term' },
];

export const formSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'word', label: $t('evie.dictionary.word'), rules: 'required' },
  {
    component: 'Select',
    componentProps: { options: categoryOptions },
    defaultValue: 'term',
    fieldName: 'category',
    label: $t('evie.dictionary.category'),
  },
  {
    component: 'Input',
    defaultValue: 'tenant',
    fieldName: 'level',
    label: $t('evie.dictionary.level'),
  },
  { component: 'InputNumber', componentProps: { class: 'w-full' }, defaultValue: 0, fieldName: 'priority', label: $t('evie.dictionary.priority') },
  {
    component: 'Input',
    fieldName: 'aliasesText',
    label: $t('evie.dictionary.aliases'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'keyword', label: $t('evie.dictionary.word') },
  {
    component: 'Select',
    componentProps: { allowClear: true, options: categoryOptions },
    fieldName: 'category',
    label: $t('evie.dictionary.category'),
  },
];

export const columns = (onClick: OnActionClickFn<any>): VxeTableGridOptions['columns'] => [
  { field: 'word', minWidth: 140, title: $t('evie.dictionary.word') },
  { field: 'level', width: 100, title: $t('evie.dictionary.level') },
  { field: 'category', width: 100, title: $t('evie.dictionary.category') },
  { field: 'source', width: 100, title: $t('evie.dictionary.source') },
  { field: 'priority', width: 90, title: $t('evie.dictionary.priority') },
  { field: 'aliases', formatter: ({ row }) => row.aliases?.length ?? 0, width: 80, title: $t('evie.dictionary.aliases') },
  { field: 'createdAt', width: 170, title: '创建时间' },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'word',
        onClick,
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('evie.dictionary.operation'),
    width: 160,
  },
];
