import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import { ApiType } from '#/api';
import { $t } from '#/locales';

export const typeFormSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'name', label: $t('system.dictionary.typeName'), rules: 'required' },
  { component: 'Input', fieldName: 'code', label: $t('system.dictionary.code'), rules: 'required' },
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 0 }, defaultValue: 10, fieldName: 'sort', label: $t('system.dictionary.sort') },
  { component: 'RadioGroup', componentProps: { options: ApiType.StatusOptions(), optionType: 'button' }, defaultValue: ApiType.Enabled, fieldName: 'status', label: $t('system.dictionary.status') },
  { component: 'Textarea', fieldName: 'remark', label: $t('system.dictionary.remark') },
];
export const itemFormSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'label', label: $t('system.dictionary.itemLabel'), rules: 'required' },
  { component: 'Input', fieldName: 'value', label: $t('system.dictionary.itemValue'), rules: 'required' },
  { component: 'Input', fieldName: 'color', label: $t('system.dictionary.color') },
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 0 }, defaultValue: 10, fieldName: 'sort', label: $t('system.dictionary.sort') },
  { component: 'RadioGroup', componentProps: { options: ApiType.StatusOptions(), optionType: 'button' }, defaultValue: ApiType.Enabled, fieldName: 'status', label: $t('system.dictionary.status') },
  { component: 'Textarea', fieldName: 'remark', label: $t('system.dictionary.remark') },
];
export const searchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'name', label: $t('system.dictionary.typeName') },
  { component: 'Input', fieldName: 'code', label: $t('system.dictionary.code') },
  { component: 'Select', componentProps: { allowClear: true, options: ApiType.StatusOptions() }, fieldName: 'status', label: $t('system.dictionary.status') },
];
export const columns = (onClick: OnActionClickFn<any>): VxeTableGridOptions['columns'] => [
  { field: 'name', minWidth: 160, title: $t('system.dictionary.typeName') },
  { field: 'code', minWidth: 160, title: $t('system.dictionary.code') },
  { cellRender: { name: 'CellTag', props: ApiType.SwitchOptions() }, field: 'status', width: 100, title: $t('system.dictionary.status') },
  { field: 'items', formatter: ({ row }) => row.items?.length ?? 0, width: 100, title: $t('system.dictionary.itemCount') },
  { field: 'createdAt', width: 180, title: $t('system.dictionary.createTime') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [
    { code: 'items', text: $t('system.dictionary.items') }, { code: 'edit', text: $t('common.edit') }, { code: 'delete', text: $t('common.delete') },
  ] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.dictionary.operation'), width: 220 },
];

