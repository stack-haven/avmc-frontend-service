import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(
  roleOptions: Array<{ label: string; value: number }>,
  deptOptions: Array<{ label: string; value: number }>,
): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'avatar',
      label: $t('system.user.avatar'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.userName'),
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.user.password'),
    },
    {
      component: 'Input',
      fieldName: 'nickname',
      label: $t('system.user.nikename'),
    },
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.user.realname'),
    },
    {
      component: 'Input',
      fieldName: 'phone',
      label: $t('system.user.phone'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
    },
    {
      component: 'DatePicker',
      componentProps: { class: 'w-full', valueFormat: 'YYYY-MM-DD' },
      fieldName: 'birthday',
      label: $t('system.user.birthday'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: deptOptions,
        placeholder: $t('system.user.deptPlaceholder'),
      },
      fieldName: 'deptId',
      label: $t('system.user.department'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.user.genderMale'), value: 'GENDER_MALE' },
          { label: $t('system.user.genderFemale'), value: 'GENDER_FEMALE' },
        ],
      },
      fieldName: 'gender',
      label: $t('system.user.gender'),
    },
    {
      component: 'Select',
      componentProps: {
        mode: 'multiple',
        options: roleOptions,
        placeholder: $t('system.user.rolePlaceholder'),
      },
      fieldName: 'roleIds',
      label: $t('system.user.roles'),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: ApiType.StatusOptions(),
        optionType: 'button',
      },
      defaultValue: ApiType.Enabled,
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('system.user.description'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.user.userName'),
    },
    { component: 'Input', fieldName: 'id', label: $t('system.user.id') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.user.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAt',
      label: $t('system.user.createTime'),
    },
  ];
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
  getDeptName?: (deptId?: number) => string,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.user.userName'),
      width: 200,
    },
    {
      field: 'realname',
      formatter: ({ cellValue }) => cellValue || '-',
      title: $t('system.user.realname'),
      width: 140,
    },
    {
      field: 'deptId',
      formatter: ({ cellValue }) => getDeptName?.(cellValue) || '-',
      title: $t('system.user.department'),
      width: 160,
    },
    {
      field: 'isTenantAdmin',
      formatter: ({ cellValue }) =>
        cellValue ? $t('system.user.tenantAdmin') : '-',
      title: $t('system.user.identity'),
      width: 120,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
    },
    {
      field: 'phone',
      formatter: ({ cellValue }) => cellValue || '-',
      minWidth: 130,
      title: $t('system.user.phone'),
    },
    {
      field: 'createdAt',
      title: $t('system.user.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 130,
    },
  ];
}
