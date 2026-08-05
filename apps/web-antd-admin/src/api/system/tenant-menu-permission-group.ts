import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';
import type { SystemMenuApi } from './menu';

import { requestClient } from '#/api/request';

export namespace SystemTenantTenantMenuPermissionGroupApi {
  export interface TenantMenuPermissionGroup {
    id: string;
    name: string;
    code: string;
    status?: string;
    isSystem?: boolean;
    sort?: number;
    description?: string;
    remark?: string;
    menuIds?: number[];
    apiPermissions?: string[];
    featureFlags?: Record<string, boolean>;
    resourceQuotas?: Record<string, number>;
    tenantCount?: number;
    createdAt?: string;
    updatedAt?: string;
    currentVersionId?: number;
    currentVersion?: number;
  }

  export interface TenantTenantMenuPermissionGroupVersion {
    id: number;
    groupId: number;
    version: number;
    state: number;
    menuIds: number[];
    apiPermissions?: string[];
    featureFlags?: Record<string, boolean>;
    resourceQuotas?: Record<string, number>;
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
    groups: TenantMenuPermissionGroup[];
    groupIds: number[];
    bindings?: TenantPermissionGroupBinding[];
  }
}

async function getTenantMenuPermissionGroupList(params?: Recordable<any>) {
  return requestClient.get<
    ApiType.ListResponse<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>
  >('/tenant-menu-permission-groups', { params });
}

async function getTenantMenuPermissionGroup(id: string) {
  return requestClient.get<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>(
    `/tenant-menu-permission-groups/${id}`,
  );
}

async function createTenantMenuPermissionGroup(
  data: Omit<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup, 'id'>,
) {
  return requestClient.post('/tenant-menu-permission-groups', data);
}

async function updateTenantMenuPermissionGroup(
  id: string,
  data: Omit<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup, 'id'>,
) {
  return requestClient.put(`/tenant-menu-permission-groups/${id}`, data);
}

async function deleteTenantMenuPermissionGroup(id: string) {
  return requestClient.delete(`/tenant-menu-permission-groups/${id}`);
}

async function updateTenantMenuPermissionGroupStatus(
  id: string,
  data: Pick<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup, 'status'>,
) {
  return requestClient.put(`/tenant-menu-permission-groups/status-update/${id}`, data);
}

async function getTenantTenantMenuPermissionGroupVersions(groupId: string | number) {
  return requestClient.get<{
    items: SystemTenantTenantMenuPermissionGroupApi.TenantTenantMenuPermissionGroupVersion[];
  }>(`/tenant-menu-permission-groups/${groupId}/versions`);
}

async function publishTenantTenantMenuPermissionGroupVersion(
  groupId: string | number,
  data: {
    apiPermissions?: string[];
    changeSummary?: string;
    featureFlags?: Record<string, boolean>;
    menuIds: number[];
    resourceQuotas?: Record<string, number>;
  },
) {
  return requestClient.post(
    `/tenant-menu-permission-groups/${groupId}/versions:publish`,
    {
      ...data,
      groupId: Number(groupId),
    },
  );
}

async function rollbackTenantTenantMenuPermissionGroupVersion(
  groupId: string | number,
  sourceVersionId: number,
) {
  return requestClient.post(
    `/tenant-menu-permission-groups/${groupId}/versions:rollback`,
    {
      changeSummary: `Rollback from version ${sourceVersionId}`,
      groupId: Number(groupId),
      sourceVersionId,
    },
  );
}

async function getTenantPermissionGroups(tenantId: string) {
  return requestClient.get<SystemTenantTenantMenuPermissionGroupApi.TenantPermissionGroups>(
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
  createTenantMenuPermissionGroup,
  deleteTenantMenuPermissionGroup,
  getCurrentTenantEffectiveMenus,
  getTenantMenuPermissionGroup,
  getTenantMenuPermissionGroupList,
  getTenantTenantMenuPermissionGroupVersions,
  getTenantEffectiveMenus,
  getTenantPermissionGroups,
  publishTenantTenantMenuPermissionGroupVersion,
  rollbackTenantTenantMenuPermissionGroupVersion,
  updateTenantMenuPermissionGroup,
  updateTenantMenuPermissionGroupStatus,
  updateTenantPermissionGroups,
  updateTenantPermissionGroupVersion,
};
