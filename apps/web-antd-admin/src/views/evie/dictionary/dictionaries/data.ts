import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

import { scopeColor } from '#/views/evie/_shared/tokens';

export const scopeOptions = [
  { label: $t('evie.dictionary.scopeTenant'), value: 'TENANT' },
  { label: $t('evie.dictionary.scopeSystem'), value: 'SYSTEM' },
  { label: $t('evie.dictionary.scopePlatform'), value: 'PLATFORM' },
];

export const sourceOptions = [
  { label: $t('evie.dictionary.sourceManual'), value: 'MANUAL' },
  { label: $t('evie.dictionary.sourceImport'), value: 'IMPORT' },
  { label: $t('evie.dictionary.sourceSync'), value: 'SYNC' },
  { label: $t('evie.dictionary.sourceApi'), value: 'API' },
];

export const statusOptions = [
  { label: $t('evie.dictionary.enabled'), value: 1 },
  { label: $t('evie.dictionary.disabled'), value: 2 },
];

// scope 列表 Tag 选项：用 evie scopeColor 着色，供 CellTag 使用。
const scopeTagOptions = () =>
  scopeOptions.map((o) => ({
    color: scopeColor(o.value),
    label: o.label,
    value: o.value,
  }));

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('evie.dictionary.name'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: { options: scopeOptions },
    defaultValue: 'TENANT',
    fieldName: 'scope',
    label: $t('evie.dictionary.scope'),
  },
  {
    component: 'Select',
    componentProps: { options: sourceOptions },
    defaultValue: 'MANUAL',
    fieldName: 'source',
    label: $t('evie.dictionary.source'),
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: $t('evie.dictionary.description'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'keyword',
    label: $t('evie.dictionary.name'),
  },
  {
    component: 'Select',
    componentProps: { allowClear: true, options: scopeOptions },
    fieldName: 'scope',
    label: $t('evie.dictionary.scope'),
  },
  {
    component: 'Select',
    componentProps: { allowClear: true, options: statusOptions },
    fieldName: 'status',
    label: $t('evie.dictionary.status'),
  },
];

export const columns = (
  onClick: OnActionClickFn<any>,
  // 预留第二参数用于「行点击进入」等扩展处理（由 list.vue 透传）
  _onRowClick?: (row: any) => void,
): VxeTableGridOptions['columns'] => [
  { field: 'name', minWidth: 160, title: $t('evie.dictionary.name') },
  {
    field: 'scope',
    minWidth: 100,
    title: $t('evie.dictionary.scope'),
    // 使用 Vben 对象式 cellRender + CellTag，PLATFORM 紫 / SYSTEM 蓝 / TENANT 绿。
    cellRender: { attrs: { options: scopeTagOptions() }, name: 'CellTag' },
  },
  {
    field: 'source',
    formatter: ({ row }) => sourceLabel(row.source),
    minWidth: 110,
    title: $t('evie.dictionary.source'),
  },
  {
    align: 'center',
    cellRender: {
      attrs: { options: statusOptions },
      name: 'CellTag',
    },
    field: 'status',
    title: $t('evie.dictionary.status'),
    width: 100,
  },
  {
    field: 'description',
    minWidth: 180,
    title: $t('evie.dictionary.description'),
  },
  {
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 170,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'name',
        onClick,
        options: [
          { code: 'enter', text: $t('common.enter') },
          { code: 'edit', text: $t('common.edit') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('evie.dictionary.operation'),
    width: 180,
  },
];

export function scopeLabel(value?: string) {
  return scopeOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}

export function sourceLabel(value?: string) {
  return sourceOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}
