import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const relationTypeOptions = [
  { label: $t('evie.relation.typeAlias'), value: 'ALIAS' },
  { label: $t('evie.relation.typeCorrection'), value: 'CORRECTION' },
  { label: $t('evie.relation.typeHomophone'), value: 'HOMOPHONE' },
  { label: $t('evie.relation.typePhoneticSimilar'), value: 'PHONETIC_SIMILAR' },
  { label: $t('evie.relation.typeAbbreviation'), value: 'ABBREVIATION' },
  { label: $t('evie.relation.typeRelated'), value: 'RELATED' },
];

export const statusOptions = [
  { label: $t('evie.dictionary.enabled'), value: 1 },
  { label: $t('evie.dictionary.disabled'), value: 2 },
];

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Select',
    componentProps: { options: relationTypeOptions },
    defaultValue: 'ALIAS',
    fieldName: 'relationType',
    label: $t('evie.relation.relationType'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'relatedText',
    label: $t('evie.relation.relatedText'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 0 },
    fieldName: 'targetEntryId',
    label: $t('evie.relation.targetEntryId'),
  },
  {
    component: 'Input',
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
    component: 'Select',
    componentProps: { allowClear: true, options: relationTypeOptions },
    fieldName: 'relationType',
    label: $t('evie.relation.relationType'),
  },
];

export const columns = (
  onClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] => [
  {
    field: 'relationType',
    formatter: ({ row }) => relationTypeLabel(row.relationType),
    title: $t('evie.relation.relationType'),
    width: 130,
  },
  {
    field: 'relatedText',
    minWidth: 140,
    title: $t('evie.relation.relatedText'),
  },
  {
    align: 'center',
    field: 'targetEntryId',
    title: $t('evie.relation.targetEntryId'),
    width: 120,
  },
  {
    field: 'source',
    title: $t('evie.dictionary.source'),
    width: 100,
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
        nameField: 'relatedText',
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

export function relationTypeLabel(value?: string) {
  return relationTypeOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}
