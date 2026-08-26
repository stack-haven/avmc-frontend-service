import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const modeOptions = [
  { label: $t('evie.enhancement.modeHighPerformance'), value: 'HIGH_PERFORMANCE' },
  { label: $t('evie.enhancement.modeStandard'), value: 'STANDARD' },
  { label: $t('evie.enhancement.modeHighAccuracy'), value: 'HIGH_ACCURACY' },
];

export const stepFields = [
  'textCleaning',
  'fillerRemoval',
  'aliasResolution',
  'deterministicReplacement',
  'pinyinCorrection',
  'fuzzyMatching',
  'contextCorrection',
] as const;

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('evie.enhancement.policyName'),
    rules: 'required',
  },
  {
    component: 'Select',
    componentProps: { options: modeOptions },
    defaultValue: 'STANDARD',
    fieldName: 'mode',
    label: $t('evie.enhancement.mode'),
  },
  ...stepFields.map((field) => ({
    component: 'Switch',
    defaultValue: true,
    fieldName: field,
    label: $t(`evie.enhancement.${field}`),
  })),
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
    label: $t('evie.enhancement.policyName'),
  },
];

export const columns = (
  onClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] => [
  {
    field: 'name',
    minWidth: 150,
    title: $t('evie.enhancement.policyName'),
  },
  {
    field: 'mode',
    formatter: ({ row }) => modeLabel(row.mode),
    title: $t('evie.enhancement.mode'),
    width: 130,
  },
  ...stepFields.map((field) => ({
    align: 'center' as const,
    cellRender: {
      attrs: {
        textMap: { true: $t('common.yes'), false: $t('common.no') },
      },
      name: 'CellTag',
    },
    field,
    title: $t(`evie.enhancement.${field}`),
    width: 110,
  })),
  {
    field: 'description',
    minWidth: 160,
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

export function modeLabel(value?: string) {
  return modeOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}
