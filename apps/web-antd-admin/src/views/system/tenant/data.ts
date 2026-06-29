import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api';

import { z } from '#/adapter/form';
import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'DatePicker',
      componentProps: {
        class: 'w-full',
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'expiresAt',
      label: $t('system.tenant.expiresAt'),
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.tenantName'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.minLength', [$t('system.tenant.tenantName'), 1]))
        .max(50, $t('ui.formRules.maxLength', [$t('system.tenant.tenantName'), 50])),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
      rules: z
        .string()
        .min(1, $t('ui.formRules.minLength', [$t('system.tenant.code'), 1]))
        .max(64, $t('ui.formRules.maxLength', [$t('system.tenant.code'), 64]))
        .regex(/^[\w-]+$/, $t('system.tenant.codeRule')),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        max: 100,
        min: 0,
      },
      defaultValue: 10,
      fieldName: 'sort',
      label: $t('system.tenant.sort'),
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
      label: $t('system.tenant.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 500,
        rows: 4,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.tenant.remark'),
      rules: z
        .string()
        .max(500, $t('ui.formRules.maxLength', [$t('system.tenant.remark'), 500]))
        .optional(),
    },
  ];
}

export function useAdminFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.tenant.adminUsername'),
      rules: z
        .string()
        .min(3, $t('ui.formRules.minLength', [$t('system.tenant.adminUsername'), 3]))
        .max(32, $t('ui.formRules.maxLength', [$t('system.tenant.adminUsername'), 32]))
        .regex(/^[\w-]+$/, $t('system.tenant.adminUsernameRule')),
    },
    {
      component: 'Input',
      componentProps: {
        type: 'password',
      },
      fieldName: 'password',
      label: $t('system.tenant.adminPassword'),
      rules: z
        .string()
        .min(12, $t('ui.formRules.minLength', [$t('system.tenant.adminPassword'), 12]))
        .max(72, $t('ui.formRules.maxLength', [$t('system.tenant.adminPassword'), 72]))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\dA-Za-z]).+$/,
          $t('system.tenant.adminPasswordRule'),
        ),
    },
    {
      component: 'Input',
      fieldName: 'realname',
      label: $t('system.tenant.adminRealname'),
      rules: z.string().max(50).optional(),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.tenant.adminEmail'),
      rules: z.string().email().max(100).optional().or(z.literal('')),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.tenantName'),
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
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.tenant.status'),
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
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      minWidth: 180,
      title: $t('system.tenant.tenantName'),
    },
    {
      field: 'code',
      minWidth: 160,
      title: $t('system.tenant.code'),
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.tenant.status'),
      width: 110,
    },
    {
      cellRender: {
        name: 'CellTag',
        options: [
          {
            color: 'processing',
            label: $t('system.tenant.lifecyclePending'),
            value: 1,
          },
          {
            color: 'success',
            label: $t('system.tenant.lifecycleActive'),
            value: 2,
          },
          {
            color: 'warning',
            label: $t('system.tenant.lifecycleSuspended'),
            value: 3,
          },
          {
            color: 'error',
            label: $t('system.tenant.lifecycleExpired'),
            value: 4,
          },
          {
            color: 'default',
            label: $t('system.tenant.lifecycleCancelled'),
            value: 5,
          },
        ],
      },
      field: 'lifecycleStatus',
      title: $t('system.tenant.lifecycleStatus'),
      width: 110,
    },
    {
      field: 'groups',
      formatter: ({ row }) => {
        const groups = row.groups ?? [];
        if (groups.length === 0) {
          return '-';
        }
        return groups
          .map(
            (
              item: NonNullable<SystemTenantApi.SystemTenant['groups']>[number],
            ) => item.name,
          )
          .join(' / ');
      },
      minWidth: 220,
      title: $t('system.tenant.packages'),
    },
    {
      field: 'sort',
      title: $t('system.tenant.sort'),
      width: 90,
    },
    {
      field: 'createdAt',
      title: $t('system.tenant.createTime'),
      width: 180,
    },
    {
      field: 'expiresAt',
      title: $t('system.tenant.expiresAt'),
      width: 180,
    },
    {
      field: 'remark',
      minWidth: 180,
      title: $t('system.tenant.remark'),
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
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.tenant.operation'),
      width: 130,
    },
  ];
}
