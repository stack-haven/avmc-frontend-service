import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantTenantMenuPermissionGroupApi } from '#/api/system/tenant-menu-permission-group';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenantMenuPermissionGroup.groupName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenantMenuPermissionGroup.code'),
      rules: 'required',
    },
    {
      component: 'InputNumber',
      defaultValue: 10,
      fieldName: 'sort',
      label: $t('system.tenantMenuPermissionGroup.sort'),
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('system.tenantMenuPermissionGroup.description'),
    },
    {
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
      fieldName: 'apiPermissionsText',
      label: $t('system.tenantMenuPermissionGroup.apiPermissions'),
    },
    {
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
      fieldName: 'featureFlagsText',
      label: $t('system.tenantMenuPermissionGroup.featureFlags'),
    },
    {
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
      fieldName: 'resourceQuotasText',
      label: $t('system.tenantMenuPermissionGroup.resourceQuotas'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenantMenuPermissionGroup.groupName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenantMenuPermissionGroup.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.tenantMenuPermissionGroup.status'),
    },
  ];
}

export function useColumns<
  T = SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.tenantMenuPermissionGroup.groupName'),
      width: 180,
    },
    {
      field: 'code',
      title: $t('system.tenantMenuPermissionGroup.code'),
      width: 180,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.tenantMenuPermissionGroup.status'),
      width: 100,
    },
    {
      field: 'currentVersion',
      formatter: ({ cellValue }: { cellValue: number }) =>
        cellValue ? `v${cellValue}` : '-',
      title: $t('system.tenantMenuPermissionGroup.currentVersion'),
      width: 100,
    },
    {
      field: 'tenantCount',
      title: $t('system.tenantMenuPermissionGroup.tenantCount'),
      width: 120,
    },
    {
      field: 'apiPermissions',
      formatter: ({ cellValue }: { cellValue?: string[] }) =>
        cellValue?.length ?? 0,
      title: $t('system.tenantMenuPermissionGroup.apiPermissionCount'),
      width: 120,
    },
    {
      field: 'description',
      minWidth: 180,
      title: $t('system.tenantMenuPermissionGroup.description'),
    },
    {
      field: 'createdAt',
      title: $t('system.tenantMenuPermissionGroup.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.tenantMenuPermissionGroup.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'menuPermissions',
            text: $t('system.tenantMenuPermissionGroup.menuPermissionAction'),
          },
          {
            code: 'versions',
            text: $t('system.tenantMenuPermissionGroup.versions'),
          },
          { code: 'edit', text: $t('common.edit') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.tenantMenuPermissionGroup.operation'),
      width: 290,
    },
  ];
}
