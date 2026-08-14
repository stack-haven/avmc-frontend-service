import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  // ===== 通知中心 =====
  {
    meta: { icon: 'mdi:bell-outline', title: $t('system.notification.title') },
    name: 'NotificationCenter',
    path: '/notif',
    children: [
      {
        path: '/notif/template',
        name: 'NotifTemplate',
        meta: { icon: 'mdi:card-text-outline', title: $t('system.notification.templates') },
        component: () => import('#/views/system/notification/template.vue'),
      },
      {
        path: '/notif/record',
        name: 'NotifRecord',
        meta: { icon: 'mdi:email-outline', title: $t('system.notification.messages') },
        component: () => import('#/views/system/notification/record.vue'),
      },
      {
        path: '/notif/provider',
        name: 'NotifProvider',
        meta: { icon: 'mdi:message-cog-outline', title: $t('system.notificationProvider.title') },
        component: () => import('#/views/system/notification-provider/list.vue'),
      },
    ],
  },
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      // ===== 租户管理 =====
      {
        path: '/system/tenant',
        name: 'SystemTenant',
        meta: {
          icon: 'mdi:office-building-cog-outline',
          title: $t('system.tenant.title'),
        },
        component: () => import('#/views/system/tenant/list.vue'),
      },
      // ===== 权限管理 =====
      {
        meta: { icon: 'mdi:shield-lock-outline', title: $t('system.permissionGroup') },
        name: 'PermissionGroup',
        path: '/system/permission-group',
        children: [
          {
            path: '/system/role',
            name: 'SystemRole',
            meta: { icon: 'mdi:account-group', title: $t('system.role.title') },
            component: () => import('#/views/system/role/list.vue'),
          },
          {
            path: '/system/menu',
            name: 'SystemMenu',
            meta: { icon: 'mdi:menu', title: $t('system.menu.title') },
            component: () => import('#/views/system/menu/list.vue'),
          },
          {
            path: '/system/tenant-menu-permission-group',
            name: 'SystemTenantMenuPermissionGroup',
            meta: { icon: 'mdi:shield-key-outline', title: $t('system.tenantMenuPermissionGroup.title') },
            component: () => import('#/views/system/tenant-menu-permission-group/list.vue'),
          },
        ],
      },
      // ===== 组织架构 =====
      {
        meta: { icon: 'mdi:account-tree-outline', title: $t('system.orgGroup') },
        name: 'OrgGroup',
        path: '/system/org-group',
        children: [
          {
            path: '/system/user',
            name: 'SystemUser',
            meta: { icon: 'charm:organisation', title: $t('system.user.title') },
            component: () => import('#/views/system/user/list.vue'),
          },
          {
            path: '/system/post',
            name: 'SystemPost',
            meta: { icon: 'mdi:badge-account-outline', title: $t('system.post.title') },
            component: () => import('#/views/system/post/list.vue'),
          },
        ],
      },
      // ===== 项目管理 =====
      {
        path: '/system/project',
        name: 'SystemProject',
        meta: { icon: 'mdi:folder-cog-outline', title: $t('system.project.title') },
        component: () => import('#/views/system/project/list.vue'),
      },
      // ===== 文件与存储 =====
      {
        meta: { icon: 'mdi:folder-file-outline', title: $t('system.fileGroup') },
        name: 'FileGroup',
        path: '/system/file-group',
        children: [
          {
            path: '/system/file-center',
            name: 'SystemFileCenter',
            meta: { icon: 'mdi:file-cloud-outline', title: $t('system.fileCenter.title') },
            component: () => import('#/views/system/file-center/list.vue'),
          },
          {
            path: '/system/storage-provider',
            name: 'SystemStorageProvider',
            meta: { icon: 'mdi:database-cog-outline', title: $t('system.storageProvider.title') },
            component: () => import('#/views/system/storage-provider/list.vue'),
          },
        ],
      },
      // ===== 监控与审计 =====
      {
        meta: { icon: 'mdi:monitor-dashboard', title: $t('system.monitorGroup') },
        name: 'MonitorGroup',
        path: '/system/monitor-group',
        children: [
          {
            path: '/system/operation-log',
            name: 'SystemOperationLog',
            meta: { icon: 'mdi:clipboard-text-clock-outline', title: $t('system.operationLog.title') },
            component: () => import('#/views/system/operation-log/list.vue'),
          },
          {
            path: '/system/login-log',
            name: 'SystemLoginLog',
            meta: { icon: 'mdi:shield-account-outline', title: $t('system.loginLog.title') },
            component: () => import('#/views/system/login-log/list.vue'),
          },
          {
            path: '/system/async-task',
            name: 'SystemAsyncTask',
            meta: { icon: 'mdi:progress-clock', title: $t('system.asyncTask.title') },
            component: () => import('#/views/system/async-task/list.vue'),
          },
          {
            path: '/system/session',
            name: 'SystemSession',
            meta: { icon: 'mdi:monitor-account', title: $t('system.session.title') },
            component: () => import('#/views/system/session/list.vue'),
          },
        ],
      },
      // ===== 系统配置 =====
      {
        meta: { icon: 'mdi:cog-outline', title: $t('system.configGroup') },
        name: 'ConfigGroup',
        path: '/system/config-group',
        children: [
          {
            path: '/system/dictionary',
            name: 'SystemDictionary',
            meta: { icon: 'mdi:book-cog-outline', title: $t('system.dictionary.title') },
            component: () => import('#/views/system/dictionary/list.vue'),
          },
          {
            path: '/system/parameter',
            name: 'SystemParameter',
            meta: { icon: 'mdi:tune-variant', title: $t('system.parameter.title') },
            component: () => import('#/views/system/parameter/list.vue'),
          },
        ],
      },
      // ===== 集成管理 =====
      {
        path: '/system/webhook',
        name: 'SystemWebhook',
        meta: { icon: 'mdi:webhook', title: $t('system.webhook.title') },
        component: () => import('#/views/system/webhook/list.vue'),
      },
    ],
  },
];

export default routes;
