import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu';

import { ApiType } from '#/api/type/index';
import { $t } from '#/locales';

export function getMenuTypeOptions() {
  return [
    {
      color: 'processing',
      label: $t('system.menu.typeCatalog'),
      value: 'MENU_TYPE_CATALOG',
    },
    {
      color: 'default',
      label: $t('system.menu.typeMenu'),
      value: 'MENU_TYPE_MENU',
    },
    {
      color: 'error',
      label: $t('system.menu.typeButton'),
      value: 'MENU_TYPE_BUTTON',
    },
    {
      color: 'success',
      label: $t('system.menu.typeEmbedded'),
      value: 'MENU_TYPE_EMBEDDED',
    },
    {
      color: 'warning',
      label: $t('system.menu.typeLink'),
      value: 'MENU_TYPE_LINK',
    },
  ];
}

export function getMenuBadgeTypesOptions() {
  return [
    {
      color: 'default',
      label: $t('system.menu.badgeType.dot'),
      value: 'BADGE_TYPE_DOT',
    },
    {
      color: 'processing',
      label: $t('system.menu.badgeType.normal'),
      value: 'BADGE_TYPE_NORMAL',
    },
  ];
}

export function getMenuBadgeVariantsOptions() {
  return [
    {
      color: 'default',
      label: 'defualt',
      value: 'BADGE_VARIANTS_DEFAULT',
    },
    {
      color: 'processing',
      label: 'destructive',
      value: 'BADGE_VARIANTS_DESTRUCTIVE',
    },
    {
      color: 'success',
      label: 'primary',
      value: 'BADGE_VARIANTS_PRIMARY',
    },
    {
      color: 'success',
      label: 'success',
      value: 'BADGE_VARIANTS_SUCCESS',
    },
    {
      color: 'warning',
      label: 'warning',
      value: 'BADGE_VARIANTS_WARNING',
    },
  ];
}

export function useColumns(
  onActionClick: OnActionClickFn<SystemMenuApi.SystemMenu>,
): VxeTableGridOptions<SystemMenuApi.SystemMenu>['columns'] {
  return [
    {
      align: 'left',
      field: 'meta.title',
      fixed: 'left',
      slots: { default: 'title' },
      title: $t('system.menu.menuTitle'),
      treeNode: true,
      width: 250,
    },
    {
      align: 'center',
      cellRender: { name: 'CellTag', options: getMenuTypeOptions() },
      field: 'type',
      title: $t('system.menu.type'),
      width: 100,
    },
    {
      field: 'authCode',
      title: $t('system.menu.authCode'),
      width: 200,
    },
    {
      align: 'left',
      field: 'path',
      title: $t('system.menu.path'),
      width: 200,
    },

    {
      align: 'left',
      field: 'component',
      formatter: ({ row }) => {
        switch (row.type) {
          case 'MENU_TYPE_CATALOG':
          case 'MENU_TYPE_MENU': {
            return row.component ?? '';
          }
          case 'MENU_TYPE_EMBEDDED': {
            return row.meta?.iframeSrc ?? '';
          }
          case 'MENU_TYPE_LINK': {
            return row.meta?.link ?? '';
          }
        }
        return '';
      },
      minWidth: 200,
      title: $t('system.menu.component'),
    },
    {
      cellRender: { name: 'CellTag', options: ApiType.StatusOptions() },
      field: 'status',
      title: $t('system.menu.status'),
      width: 100,
    },

    {
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: '新增下级',
          },
          'edit', // 默认的编辑按钮
          'delete', // 默认的删除按钮
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.menu.operation'),
      width: 200,
    },
  ];
}
