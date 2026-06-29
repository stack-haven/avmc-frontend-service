import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.menuPermissionGroup.groupName'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.menuPermissionGroup.code'),
      rules: 'required',
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
      label: $t('system.menuPermissionGroup.status'),
    },
    {
      component: 'InputNumber',
      defaultValue: 10,
      fieldName: 'sort',
      label: $t('system.menuPermissionGroup.sort'),
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('system.menuPermissionGroup.description'),
    },
    {
      component: 'Input',
      fieldName: 'menuIds',
      formItemClass: 'items-start',
      label: $t('system.menuPermissionGroup.menus'),
      modelPropName: 'modelValue',
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.menuPermissionGroup.groupName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.menuPermissionGroup.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.menuPermissionGroup.status'),
    },
  ];
}

export function useColumns<T = SystemMenuPermissionGroupApi.MenuPermissionGroup>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.menuPermissionGroup.groupName'),
      width: 180,
    },
    {
      field: 'code',
      title: $t('system.menuPermissionGroup.code'),
      width: 180,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.menuPermissionGroup.status'),
      width: 100,
    },
    {
      field: 'tenantCount',
      title: $t('system.menuPermissionGroup.tenantCount'),
      width: 120,
    },
    {
      field: 'description',
      minWidth: 180,
      title: $t('system.menuPermissionGroup.description'),
    },
    {
      field: 'createdAt',
      title: $t('system.menuPermissionGroup.createTime'),
      width: 180,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.menuPermissionGroup.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.menuPermissionGroup.operation'),
      width: 130,
    },
  ];
}
