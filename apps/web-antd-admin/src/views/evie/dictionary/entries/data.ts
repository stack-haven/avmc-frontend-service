import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const entryTypeOptions = [
  { label: $t('evie.entry.typeWord'), value: 'WORD' },
  { label: $t('evie.entry.typePhrase'), value: 'PHRASE' },
];

export const categoryOptions = [
  { label: $t('evie.entry.categoryPerson'), value: 'PERSON' },
  { label: $t('evie.entry.categoryOrganization'), value: 'ORGANIZATION' },
  { label: $t('evie.entry.categoryProduct'), value: 'PRODUCT' },
  { label: $t('evie.entry.categoryTerm'), value: 'TERM' },
  { label: $t('evie.entry.categoryLocation'), value: 'LOCATION' },
  { label: $t('evie.entry.categoryIndustry'), value: 'INDUSTRY' },
  { label: $t('evie.entry.categoryBrand'), value: 'BRAND' },
  { label: $t('evie.entry.categoryCustom'), value: 'CUSTOM' },
];

export const statusOptions = [
  { label: $t('evie.dictionary.enabled'), value: 1 },
  { label: $t('evie.dictionary.disabled'), value: 2 },
];

export const formSchema = (): VbenFormSchema[] => [
  // 必填信息组（视觉分组标记）
  {
    fieldName: 'groupBasic',
    label: $t('evie.entry.basicInfo'),
    component: 'Divider',
    componentProps: { orientation: 'left' },
  },
  {
    component: 'Input',
    fieldName: 'standardText',
    label: $t('evie.entry.standardText'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: { options: entryTypeOptions },
    defaultValue: 'WORD',
    fieldName: 'entryType',
    label: $t('evie.entry.entryType'),
  },
  {
    component: 'Select',
    componentProps: { options: categoryOptions },
    defaultValue: 'PERSON',
    fieldName: 'category',
    label: $t('evie.entry.category'),
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 0 },
    defaultValue: 0,
    fieldName: 'priority',
    label: $t('evie.entry.priority'),
  },

  // 高级字段组（默认折叠，收纳在 Collapse 面板下）
  {
    fieldName: 'groupAdvanced',
    label: $t('evie.entry.advancedFields'),
    component: 'Divider',
    componentProps: { orientation: 'left' },
  },
  {
    component: 'Input',
    fieldName: 'pinyin',
    label: $t('evie.entry.pinyin'),
  },
  {
    component: 'Input',
    fieldName: 'pinyinInitial',
    label: $t('evie.entry.pinyinInitial'),
  },
  {
    component: 'Input',
    fieldName: 'normalizedText',
    label: $t('evie.entry.normalizedText'),
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: $t('evie.dictionary.description'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [],
      placeholder: $t('evie.dictionary.selectDictionary'),
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'dictionaryId',
    label: $t('evie.dictionary.name'),
  },
  {
    component: 'Input',
    fieldName: 'keyword',
    label: $t('evie.entry.standardText'),
  },
  {
    component: 'Select',
    componentProps: { allowClear: true, options: categoryOptions },
    fieldName: 'category',
    label: $t('evie.entry.category'),
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
): VxeTableGridOptions['columns'] => [
  {
    field: 'standardText',
    minWidth: 140,
    title: $t('evie.entry.standardText'),
  },
  {
    field: 'entryType',
    formatter: ({ row }) => entryTypeLabel(row.entryType),
    title: $t('evie.entry.entryType'),
    width: 100,
  },
  {
    field: 'category',
    formatter: ({ row }) => categoryLabel(row.category),
    title: $t('evie.entry.category'),
    width: 120,
  },
  {
    align: 'center',
    field: 'priority',
    title: $t('evie.entry.priority'),
    width: 90,
  },
  {
    field: 'pinyin',
    minWidth: 120,
    title: $t('evie.entry.pinyin'),
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
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 170,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'standardText',
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
    width: 150,
  },
];

export function entryTypeLabel(value?: string) {
  return entryTypeOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}

export function categoryLabel(value?: string) {
  return categoryOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}
