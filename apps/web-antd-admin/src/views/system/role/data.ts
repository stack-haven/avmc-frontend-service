import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
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
      label: $t('system.role.status'),
    },
    {
      component: 'Select',
      componentProps: {
        options: [
          { label: $t('system.role.scopeAll'), value: 1 },
          { label: $t('system.role.scopeSelf'), value: 2 },
          { label: $t('system.role.scopeDept'), value: 3 },
          { label: $t('system.role.scopeDeptTree'), value: 4 },
          { label: $t('system.role.scopeCustom'), value: 5 },
        ],
      },
      defaultValue: 2,
      fieldName: 'dataScope',
      label: $t('system.role.dataScope'),
      rules: 'required',
    },
    {
      component: 'Input',
      dependencies: {
        show: (values: Record<string, any>) => values.dataScope === 5,
        triggerFields: ['dataScope'],
      },
      fieldName: 'deptIds',
      formItemClass: 'items-start',
      label: $t('system.role.customDepartments'),
      modelPropName: 'modelValue',
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.roleName'),
    },
    { component: 'Input', fieldName: 'id', label: $t('system.role.id') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.role.status'),
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAt',
      label: $t('system.role.createTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      title: $t('system.role.roleName'),
      width: 200,
    },
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 200,
    },
    {
      field: 'isTenantAdmin',
      formatter: ({ cellValue }: { cellValue: boolean }) =>
        cellValue ? $t('system.role.tenantAdmin') : '-',
      title: $t('system.role.roleType'),
      width: 120,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
    },
    {
      field: 'remark',
      minWidth: 100,
      title: $t('system.role.remark'),
    },
    {
      field: 'createdAt',
      title: $t('system.role.createTime'),
      width: 200,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          { code: 'edit', text: $t('common.edit') },
          {
            code: 'menuPermissions',
            text: $t('system.role.configureMenus'),
          },
          {
            code: 'delete',
            danger: true,
            disabled: (row: SystemRoleApi.SystemRole) => row.isTenantAdmin,
            text: $t('common.delete'),
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 260,
    },
  ];
}
