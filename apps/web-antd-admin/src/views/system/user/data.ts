import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { reactive } from 'vue';

import { ApiType, getDeptList } from '#/api';
import { $t } from '#/locales';

/** 模块级部门名称映射表，由 list.vue 在加载部门树后写入 */
export const deptNameMap = reactive<Record<number, string>>({});

export function useFormSchema(): VbenFormSchema[] {
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
      component: 'ApiTreeSelect',
      componentProps: {
        allowClear: true,
        api: getDeptList,
        childrenField: 'children',
        class: 'w-full',
        labelField: 'name',
        placeholder: $t('system.user.deptPlaceholder'),
        resultField: 'items',
        showSearch: true,
        treeDefaultExpandAll: true,
        valueField: 'id',
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
          { label: $t('system.user.genderUnknown'), value: 'GENDER_UNSPECIFIED' },
        ],
      },
      fieldName: 'gender',
      label: $t('system.user.gender'),
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
      formItemClass: 'form-field-textarea',
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
      formatter: ({ cellValue }: { cellValue: number }) =>
        deptNameMap[cellValue] || '-',
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
        options: [
          { code: 'edit', text: $t('system.user.editProfile') },
          {
            code: 'roles',
            ghost: true,
            icon: 'mdi:account-key-outline',
            text: $t('system.user.configureRoles'),
            type: 'primary',
          },
          { code: 'delete', danger: true, text: $t('common.delete') },
        ],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 300,
    },
  ];
}
