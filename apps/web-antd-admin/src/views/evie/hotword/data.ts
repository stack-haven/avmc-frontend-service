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
  { component: 'Input', fieldName: 'word', label: $t('evie.hotword.word'), rules: 'required' },
  { component: 'Input', fieldName: 'target', label: $t('evie.hotword.target') },
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 0, max: 10 }, defaultValue: 5, fieldName: 'weight', label: $t('evie.hotword.weight') },
  {
    component: 'Select',
    componentProps: { options: categoryOptions },
    defaultValue: 'term',
    fieldName: 'category',
    label: $t('evie.hotword.category'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Select',
    componentProps: { allowClear: true, options: categoryOptions },
    fieldName: 'category',
    label: $t('evie.hotword.category'),
  },
];

export const columns = (onClick: OnActionClickFn<any>): VxeTableGridOptions['columns'] => [
  { field: 'word', minWidth: 140, title: $t('evie.hotword.word') },
  { field: 'target', minWidth: 140, title: $t('evie.hotword.target') },
  { field: 'weight', width: 90, title: $t('evie.hotword.weight') },
  { field: 'category', width: 110, title: $t('evie.hotword.category') },
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
    title: $t('evie.hotword.operation'),
    width: 160,
  },
];
