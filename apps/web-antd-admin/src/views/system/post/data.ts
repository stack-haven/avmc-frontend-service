import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.post.postName'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 0, max: 100 },
      defaultValue: 10,
      fieldName: 'sort',
      label: $t('system.post.sort'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: ApiType.StatusOptions(),
        optionType: 'button',
      },
      defaultValue: ApiType.Enabled,
      fieldName: 'status',
      label: $t('system.post.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.post.remark'),
    },
  ];
}

export function useSearchSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.post.postName'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.post.status'),
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] {
  return [
    { field: 'name', minWidth: 160, title: $t('system.post.postName') },
    { field: 'sort', width: 80, title: $t('system.post.sort') },
    {
      cellRender: { name: 'CellTag', options: ApiType.StatusOptions() },
      field: 'status',
      width: 100,
      title: $t('system.post.status'),
    },
    { field: 'remark', minWidth: 160, title: $t('system.post.remark') },
    {
      field: 'createdAt',
      width: 180,
      title: $t('system.post.createTime'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
          options: [
            { code: 'edit', text: $t('common.edit') },
            { code: 'delete', text: $t('common.delete') },
          ],
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.post.operation'),
      width: 160,
    },
  ];
}
