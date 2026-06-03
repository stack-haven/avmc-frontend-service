import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemProjectApi } from '#/api';

import { z } from '#/adapter/form';
import { ApiType } from '#/api';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.project.projectName'),
      rules: z
        .string()
        .min(
          1,
          $t('ui.formRules.minLength', [$t('system.project.projectName'), 1]),
        )
        .max(
          50,
          $t('ui.formRules.maxLength', [$t('system.project.projectName'), 50]),
        ),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.project.code'),
      rules: z
        .string()
        .max(50, $t('ui.formRules.maxLength', [$t('system.project.code'), 50]))
        .optional(),
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        min: 1,
      },
      fieldName: 'ownerId',
      label: $t('system.project.ownerId'),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: $t('system.project.memberIdsPlaceholder'),
      },
      fieldName: 'memberIdsText',
      label: $t('system.project.memberIds'),
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
      label: $t('system.project.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 500,
        rows: 4,
        showCount: true,
      },
      fieldName: 'description',
      label: $t('system.project.description'),
      rules: z
        .string()
        .max(
          500,
          $t('ui.formRules.maxLength', [$t('system.project.description'), 500]),
        )
        .optional(),
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.project.projectName'),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.project.code'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: ApiType.StatusOptions(),
      },
      fieldName: 'status',
      label: $t('system.project.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAt',
      label: $t('system.project.createTime'),
    },
  ];
}

export function useColumns<T = SystemProjectApi.SystemProject>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'name',
      minWidth: 180,
      title: $t('system.project.projectName'),
    },
    {
      field: 'code',
      minWidth: 140,
      title: $t('system.project.code'),
    },
    {
      field: 'ownerName',
      minWidth: 120,
      title: $t('system.project.owner'),
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
        props: ApiType.SwitchOptions(),
      },
      field: 'status',
      title: $t('system.project.status'),
      width: 110,
    },
    {
      field: 'createdAt',
      title: $t('system.project.createTime'),
      width: 180,
    },
    {
      field: 'description',
      minWidth: 180,
      title: $t('system.project.description'),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.project.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.project.operation'),
      width: 130,
    },
  ];
}
