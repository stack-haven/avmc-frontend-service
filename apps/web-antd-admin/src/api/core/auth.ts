import type { RouteRecordStringComponent, UserInfo } from '@vben/types';

import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    tenantId?: number;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
  }

  export interface RefreshTokenResult {
    accessToken: string;
    refreshToken: string;
    sessionId?: string;
  }

  export interface ProfileResult extends UserInfo {
    accessToken: string;
  }

  export interface MenusResult {
    items: RouteRecordStringComponent[];
  }

  export interface AccessCodesResult {
    codes: string[];
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi(refreshToken: string) {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/auth/refresh-token',
    { refreshToken },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return requestClient.post('/auth/logout');
}

/**
 * 登录-用户名密码登录
 */
export async function loginPasswordApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/auth/login/password', {
    tenantId: 1,
    ...data,
  });
}

/**
 * 获取登录用户信息
 */
export async function getAcccessProfileApi() {
  return requestClient.get<AuthApi.ProfileResult>('/auth/vben/profile');
}

/**
 * 获取登录用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient
    .get<AuthApi.AccessCodesResult>('/auth/codes')
    .then((res) => res.codes ?? []);
}

function normalizeMenuQuery(
  menu: RouteRecordStringComponent,
): RouteRecordStringComponent {
  const rawQuery = menu.meta?.query;
  let query = rawQuery;
  if (typeof rawQuery === 'string') {
    try {
      query = rawQuery ? JSON.parse(rawQuery) : undefined;
    } catch {
      query = undefined;
    }
  }
  return {
    ...menu,
    children: menu.children?.map(normalizeMenuQuery),
    meta: menu.meta ? { ...menu.meta, query } : undefined,
  };
}

/**
 * 获取登录用户菜单树
 */
export async function getAccessMenusApi(): Promise<
  RouteRecordStringComponent[]
> {
  return requestClient
    .get<AuthApi.MenusResult>('/auth/menus')
    .then((res) => (res.items ?? []).map(normalizeMenuQuery));
}
/**
 * 获取登录用户菜单树
 */
// export async function getAccessMenusApi() {
//   const menus: RouteRecordStringComponent[] = await requestClient.get<AuthApi.MenusResult>('/auth/menus').then(res => {
//     console.log(res?.routes);
//     return res.routes ?? []
//   });

//   console.log("menus", menus);

//   const res = Promise.resolve<RouteRecordStringComponent[]>([
//     {
//       path: '/',
//       redirect: '/dashboard',
//       component: 'Layout', // 添加 component 属性
//       children: [
//         {
//           path: '/dashboard',
//           name: 'Dashboard',
//           meta: {
//             title: 'Dashboard',
//             icon: 'ion:grid-outline',
//           },
//           component: 'DashboardPage', // 添加 component 属性
//           children: []
//         }
//       ]
//     },
//     {
//       path: '/home',
//       redirect: '/home/index',
//       component: 'Layout', // 添加 component 属性
//       children: [
//         {
//           path: '/dashboard',
//           name: 'Dashboard',
//           meta: {
//             title: 'Dashboard',
//             icon: 'ion:grid-outline',
//           },
//           component: 'DashboardPage', // 添加 component 属性
//           children: []
//         }
//       ]
//     }
//   ]);

//   return res;
// }
