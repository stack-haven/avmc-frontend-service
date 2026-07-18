import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/project',
        name: 'SystemProject',
        meta: {
          icon: 'mdi:folder-cog-outline',
          title: $t('system.project.title'),
        },
        component: () => import('#/views/system/project/list.vue'),
      },
      {
        path: '/system/tenant',
        name: 'SystemTenant',
        meta: {
          icon: 'mdi:office-building-cog-outline',
          title: $t('system.tenant.title'),
        },
        component: () => import('#/views/system/tenant/list.vue'),
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: $t('system.menu.title'),
        },
        component: () => import('#/views/system/menu/list.vue'),
      },
      {
        path: '/system/menu-permission-group',
        name: 'SystemMenuPermissionGroup',
        meta: {
          icon: 'mdi:shield-key-outline',
          title: $t('system.menuPermissionGroup.title'),
        },
        component: () =>
          import('#/views/system/menu-permission-group/list.vue'),
      },
      {
        path: '/system/tenant-permission',
        name: 'SystemTenantPermission',
        meta: {
          icon: 'mdi:domain',
          title: $t('system.tenantPermission.title'),
        },
        component: () => import('#/views/system/tenant-permission/list.vue'),
      },
      {
        path: '/system/dictionary',
        name: 'SystemDictionary',
        meta: { icon: 'mdi:book-cog-outline', title: $t('system.dictionary.title') },
        component: () => import('#/views/system/dictionary/list.vue'),
      },
      {
        path: '/system/parameter',
        name: 'SystemParameter',
        meta: {
          icon: 'mdi:tune-variant',
          title: $t('system.parameter.title'),
        },
        component: () => import('#/views/system/parameter/list.vue'),
      },
      {
        path: '/system/storage-provider',
        name: 'SystemStorageProvider',
        meta: {
          icon: 'mdi:database-cog-outline',
          title: $t('system.storageProvider.title'),
        },
        component: () => import('#/views/system/storage-provider/list.vue'),
      },
      {
        path: '/system/operation-log',
        name: 'SystemOperationLog',
        meta: { icon: 'mdi:clipboard-text-clock-outline', title: $t('system.operationLog.title') },
        component: () => import('#/views/system/operation-log/list.vue'),
      },
      {
        path: '/system/async-task',
        name: 'SystemAsyncTask',
        meta: {
          icon: 'mdi:progress-clock',
          title: $t('system.asyncTask.title'),
        },
        component: () => import('#/views/system/async-task/list.vue'),
      },
      {
        path: '/system/login-log',
        name: 'SystemLoginLog',
        meta: {
          icon: 'mdi:shield-account-outline',
          title: $t('system.loginLog.title'),
        },
        component: () => import('#/views/system/login-log/list.vue'),
      },
      {
        path: '/system/session',
        name: 'SystemSession',
        meta: {
          icon: 'mdi:monitor-account',
          title: $t('system.session.title'),
        },
        component: () => import('#/views/system/session/list.vue'),
      },
      {
        path: '/system/dept',
        name: 'SystemDept',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.dept.title'),
        },
        component: () => import('#/views/system/dept/list.vue'),
      },
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
    ],
  },
];

export default routes;
