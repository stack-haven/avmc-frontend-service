import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'BADGE_VARIANTS_UNSPECIFIED',
    'BADGE_VARIANTS_DEFAULT',
    'BADGE_VARIANTS_DESTRUCTIVE',
    'BADGE_VARIANTS_PRIMARY',
    'BADGE_VARIANTS_SUCCESS',
    'BADGE_VARIANTS_WARNING',
  ] as const;
  /** 徽标类型集合 */
  export const BadgeTypes = ['BADGE_TYPE_UNSPECIFIED', 'BADGE_TYPE_DOT', 'BADGE_TYPE_NORMAL'] as const;
  /** 菜单类型集合 */
  export const MenuTypes = [
    'MENU_TYPE_CATALOG',
    'MENU_TYPE_MENU',
    'MENU_TYPE_EMBEDDED',
    'MENU_TYPE_LINK',
    'MENU_TYPE_BUTTON',
  ] as const;
  /** 系统菜单 */
  export interface SystemMenu {
    [key: string]: any;
    /** 后端权限标识 */
    authCode: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: string;
    /** 菜单元数据 */
    meta?: {
      /** 激活时显示的图标 */
      activeIcon?: string;
      /** 作为路由时，需要激活的菜单的Path */
      activePath?: string;
      /** 固定在标签栏 */
      affixTab?: boolean;
      /** 在标签栏固定的顺序 */
      affixTabOrder?: number;
      /** 徽标内容(当徽标类型为normal时有效) */
      badge?: string;
      /** 徽标类型 */
      badgeType?: (typeof BadgeTypes)[number] | keyof typeof BadgeTypes;
      /** 徽标颜色 */
      badgeVariants?:
        | (typeof BadgeVariants)[number]
        | keyof typeof BadgeVariants;
      /** 在菜单中隐藏下级 */
      hideChildrenInMenu?: boolean;
      /** 在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 在标签栏中隐藏 */
      hideInTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 内嵌Iframe的URL */
      iframeSrc?: string;
      /** 是否缓存页面 */
      keepAlive?: boolean;
      /** 外链页面的URL */
      link?: string;
      /** 同一个路由最大打开的标签数 */
      maxNumOfOpenTab?: number;
      /** 无需基础布局 */
      noBasicLayout?: boolean;
      /** 是否在新窗口打开 */
      openInNewWindow?: boolean;
      /** 菜单排序 */
      order?: number;
      /** 额外的路由参数 */
      query?: Recordable<any>;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    parentId: string;
    /** 重定向 */
    redirect?: string;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number] | keyof typeof MenuTypes;
  }

  export interface ExitstMenu {
    exist: boolean;
  }
}

/**
 * 获取菜单数据列表
 */
// async function getMenuList(): Promise<Array<SystemMenuApi.SystemMenu>> {
//   const res = await requestClient.get<ApiType.ListResponse<SystemMenuApi.SystemMenu>>('/menus/tree')
//   return res.items;
// }
async function getMenuList() {
  return requestClient.get<
    | ApiType.ListResponse<SystemMenuApi.SystemMenu>
    | Array<SystemMenuApi.SystemMenu>
  >('/menus/tree');
}

async function isMenuNameExists(
  name: string,
  id?: SystemMenuApi.SystemMenu['id'],
): Promise<boolean> {
  const res = await requestClient.post<SystemMenuApi.ExitstMenu>(
    '/menus/name-exists',
    { id, name },
  );
  return res.exist;
}

async function isMenuPathExists(
  path: string,
  id?: SystemMenuApi.SystemMenu['id'],
): Promise<boolean> {
  const res = await requestClient.post<SystemMenuApi.ExitstMenu>(
    '/menus/path-exists',
    { id, path },
  );
  return res.exist;
}
/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.post('/menus', data);
}

/**
 * 更新菜单
 *
 * @param id 菜单 ID
 * @param data 菜单数据
 */
async function updateMenu(
  id: string,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.put(`/menus/${id}`, data);
}

/**
 * 删除菜单
 * @param id 菜单 ID
 */
async function deleteMenu(id: string) {
  return requestClient.delete(`/menus/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuList,
  isMenuNameExists,
  isMenuPathExists,
  updateMenu,
};
