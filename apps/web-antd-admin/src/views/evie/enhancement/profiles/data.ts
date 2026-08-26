import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    fieldName: 'name',
    label: $t('evie.enhancement.profileName'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 1 },
    fieldName: 'policyId',
    label: $t('evie.enhancement.policyId'),
    rules: 'required',
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
];

export const columns = (
  onClick: OnActionClickFn<any>,
  policyNameMap: Record<number, string>,
): VxeTableGridOptions['columns'] => [
  {
    field: 'name',
    minWidth: 150,
    title: $t('evie.enhancement.profileName'),
  },
  {
    field: 'policyId',
    formatter: ({ row }) => policyNameMap[row.policyId] ?? row.policyId ?? '-',
    minWidth: 140,
    title: $t('evie.enhancement.policyName'),
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
