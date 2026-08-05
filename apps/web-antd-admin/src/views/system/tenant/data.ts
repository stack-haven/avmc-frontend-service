import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api';

import { $t } from '#/locales';

import {
  LifecycleStatusDisplayOptions,
  LifecycleStatusOptions,
} from '#/api/system/tenant';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: { max: 100, min: 0 },
      defaultValue: 10,
      fieldName: 'sort',
      label: $t('system.tenant.sort'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.tenant.remark'),
    },
    {
      component: 'DatePicker',
      componentProps: { showTime: true, valueFormat: 'YYYY-MM-DD HH:mm:ss' },
      fieldName: 'expiresAt',
      label: $t('system.tenant.expiresAt'),
    },
  ];
}

export function useAdminFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.tenant.adminUsername'),
      rules: 'required',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.tenant.adminPassword'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.tenant.adminRealname'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.tenant.adminEmail'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: LifecycleStatusOptions(),
      },
      fieldName: 'lifecycle_status',
      label: $t('system.tenant.lifecycleStatus'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAt',
      label: $t('system.tenant.createTime'),
    },
  ];
}

export function useColumns<T = SystemTenantApi.SystemTenant>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  return [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'name',
      title: $t('system.tenant.name'),
      minWidth: 160,
    },
    {
      field: 'code',
      title: $t('system.tenant.code'),
      width: 140,
    },
    {
      field: 'lifecycleStatus',
      cellRender: {
        name: 'CellTag',
        options: LifecycleStatusDisplayOptions(),
      },
      title: $t('system.tenant.lifecycleStatus'),
      width: 120,
    },
    {
      field: 'groupIds',
      formatter: ({ cellValue }: { cellValue: number[] }) =>
        cellValue?.length
          ? $t('system.tenant.packageCount', [cellValue.length])
          : '-',
      title: $t('system.tenant.packages'),
      width: 110,
    },
    {
      field: 'isPlatform',
      formatter: ({ cellValue }: { cellValue: boolean }) =>
        cellValue ? $t('system.tenant.platform') : '-',
      title: $t('system.tenant.platform'),
      width: 100,
    },
    {
      field: 'expiresAt',
      title: $t('system.tenant.expiresAt'),
      width: 180,
    },
    {
      field: 'sort',
      title: $t('system.tenant.sort'),
      width: 80,
    },
    {
      field: 'remark',
      minWidth: 120,
      title: $t('system.tenant.remark'),
    },
    {
      field: 'createdAt',
      title: $t('system.tenant.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.tenant.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'admins', text: $t('system.tenant.adminAction') },
          {
            code: 'lifecycle',
            text: $t('system.tenant.lifecycleAction'),
          },
          { code: 'delete', danger: true, text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.tenant.operation'),
      width: 280,
    },
  ];
}
