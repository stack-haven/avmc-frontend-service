import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';
import type { SystemMenuApi } from './menu';

import { requestClient } from '#/api/request';

export namespace SystemMenuPermissionGroupApi {
  export interface MenuPermissionGroup {
    id: string;
    name: string;
    code: string;
    status?: string;
    isSystem?: boolean;
    sort?: number;
    description?: string;
    remark?: string;
    menuIds?: number[];
    tenantCount?: number;
    createdAt?: string;
    updatedAt?: string;
    currentVersionId?: number;
    currentVersion?: number;
  }

  export interface MenuPermissionGroupVersion {
    id: number;
    groupId: number;
    version: number;
    state: number;
    menuIds: number[];
    changeSummary?: string;
    createdBy?: number;
    publishedBy?: number;
    effectiveAt?: string;
    publishedAt?: string;
    createdAt?: string;
  }

  export interface TenantPermissionGroupBinding {
    tenantId: number;
    groupId: number;
    enabled?: boolean;
    versionId?: number;
    version?: number;
    autoUpgrade?: boolean;
  }

  export interface TenantPermissionGroups {
    groups: MenuPermissionGroup[];
    groupIds: number[];
    bindings?: TenantPermissionGroupBinding[];
  }
}

async function getMenuPermissionGroupList(params?: Recordable<any>) {
  return requestClient.get<
    ApiType.ListResponse<SystemMenuPermissionGroupApi.MenuPermissionGroup>
  >('/menu-permission-groups', { params });
}

async function getMenuPermissionGroup(id: string) {
  return requestClient.get<SystemMenuPermissionGroupApi.MenuPermissionGroup>(
    `/menu-permission-groups/${id}`,
  );
}

async function createMenuPermissionGroup(
  data: Omit<SystemMenuPermissionGroupApi.MenuPermissionGroup, 'id'>,
) {
  return requestClient.post('/menu-permission-groups', data);
}

async function updateMenuPermissionGroup(
  id: string,
  data: Omit<SystemMenuPermissionGroupApi.MenuPermissionGroup, 'id'>,
) {
  return requestClient.put(`/menu-permission-groups/${id}`, data);
}

async function deleteMenuPermissionGroup(id: string) {
  return requestClient.delete(`/menu-permission-groups/${id}`);
}

async function updateMenuPermissionGroupStatus(
  id: string,
  data: Pick<SystemMenuPermissionGroupApi.MenuPermissionGroup, 'status'>,
) {
  return requestClient.put(`/menu-permission-groups/status-update/${id}`, data);
}

async function getMenuPermissionGroupVersions(groupId: string | number) {
  return requestClient.get<{
    items: SystemMenuPermissionGroupApi.MenuPermissionGroupVersion[];
  }>(`/menu-permission-groups/${groupId}/versions`);
}

async function publishMenuPermissionGroupVersion(
  groupId: string | number,
  data: { changeSummary?: string; menuIds: number[] },
) {
  return requestClient.post(
    `/menu-permission-groups/${groupId}/versions:publish`,
    {
      ...data,
      groupId: Number(groupId),
    },
  );
}

async function rollbackMenuPermissionGroupVersion(
  groupId: string | number,
  sourceVersionId: number,
) {
  return requestClient.post(
    `/menu-permission-groups/${groupId}/versions:rollback`,
    {
      changeSummary: `Rollback from version ${sourceVersionId}`,
      groupId: Number(groupId),
      sourceVersionId,
    },
  );
}

async function getTenantPermissionGroups(tenantId: string) {
  return requestClient.get<SystemMenuPermissionGroupApi.TenantPermissionGroups>(
    `/tenants/${tenantId}/permission-groups`,
  );
}

async function updateTenantPermissionGroups(
  tenantId: string,
  groupIds: number[],
) {
  return requestClient.put(`/tenants/${tenantId}/permission-groups`, {
    groupIds,
    tenantId: Number(tenantId),
  });
}

async function getTenantEffectiveMenus(tenantId: string) {
  return requestClient.get<ApiType.ListResponse<SystemMenuApi.SystemMenu>>(
    `/tenants/${tenantId}/effective-menus`,
  );
}

async function getCurrentTenantEffectiveMenus() {
  return requestClient.get<ApiType.ListResponse<SystemMenuApi.SystemMenu>>(
    '/current-tenant/effective-menus',
  );
}

async function updateTenantPermissionGroupVersion(
  tenantId: string | number,
  groupId: string | number,
  data: { autoUpgrade: boolean; versionId?: number },
) {
  return requestClient.put(
    `/tenants/${tenantId}/permission-groups/${groupId}/version`,
    {
      ...data,
      groupId: Number(groupId),
      tenantId: Number(tenantId),
    },
  );
}

export {
  createMenuPermissionGroup,
  deleteMenuPermissionGroup,
  getCurrentTenantEffectiveMenus,
  getMenuPermissionGroup,
  getMenuPermissionGroupList,
  getMenuPermissionGroupVersions,
  getTenantEffectiveMenus,
  getTenantPermissionGroups,
  publishMenuPermissionGroupVersion,
  rollbackMenuPermissionGroupVersion,
  updateMenuPermissionGroup,
  updateMenuPermissionGroupStatus,
  updateTenantPermissionGroups,
  updateTenantPermissionGroupVersion,
};
