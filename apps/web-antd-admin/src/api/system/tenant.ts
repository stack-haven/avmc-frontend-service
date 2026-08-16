import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';
import { $t } from '#/locales';

export type TenantLifecycleStatus =
  | 'TENANT_LIFECYCLE_STATUS_ACTIVE'
  | 'TENANT_LIFECYCLE_STATUS_CANCELLED'
  | 'TENANT_LIFECYCLE_STATUS_EXPIRED'
  | 'TENANT_LIFECYCLE_STATUS_PENDING'
  | 'TENANT_LIFECYCLE_STATUS_SUSPENDED';

export namespace SystemTenantApi {
  export interface SystemTenant {
    id: number;
    name: string;
    code: string;
    sort?: number;
    remark?: string;
    lifecycleStatus?: number | TenantLifecycleStatus;
    isPlatform?: boolean;
    activatedAt?: string;
    expiresAt?: string;
    suspendedAt?: string;
    cancelledAt?: string;
    groupIds?: number[];
    createdAt?: string;
    updatedAt?: string;
  }

  export interface TenantInitialAdmin {
    username: string;
    password: string;
    realname?: string;
    email?: string;
  }

  export interface TenantAdmin {
    id: number;
    name: string;
    realname?: string;
    email?: string;
    phone?: string;
    status?: string;
    isTenantAdmin: boolean;
    createdAt?: string;
  }
}

const LegacyLifecycleStatusMap: Record<number, TenantLifecycleStatus> = {
  1: 'TENANT_LIFECYCLE_STATUS_PENDING',
  2: 'TENANT_LIFECYCLE_STATUS_ACTIVE',
  3: 'TENANT_LIFECYCLE_STATUS_SUSPENDED',
  4: 'TENANT_LIFECYCLE_STATUS_EXPIRED',
  5: 'TENANT_LIFECYCLE_STATUS_CANCELLED',
};

const lifecycleStatusKeys: TenantLifecycleStatus[] = [
  'TENANT_LIFECYCLE_STATUS_PENDING',
  'TENANT_LIFECYCLE_STATUS_ACTIVE',
  'TENANT_LIFECYCLE_STATUS_SUSPENDED',
  'TENANT_LIFECYCLE_STATUS_EXPIRED',
  'TENANT_LIFECYCLE_STATUS_CANCELLED',
];

const lifecycleStatusLocaleKeys: Record<TenantLifecycleStatus, string> = {
  TENANT_LIFECYCLE_STATUS_ACTIVE: 'system.tenant.lifecycleActive',
  TENANT_LIFECYCLE_STATUS_CANCELLED: 'system.tenant.lifecycleCancelled',
  TENANT_LIFECYCLE_STATUS_EXPIRED: 'system.tenant.lifecycleExpired',
  TENANT_LIFECYCLE_STATUS_PENDING: 'system.tenant.lifecyclePending',
  TENANT_LIFECYCLE_STATUS_SUSPENDED: 'system.tenant.lifecycleSuspended',
};

export function normalizeLifecycleStatus(
  value?: number | string,
): TenantLifecycleStatus | undefined {
  if (typeof value === 'number') return LegacyLifecycleStatusMap[value];
  return lifecycleStatusKeys.includes(value as TenantLifecycleStatus)
    ? (value as TenantLifecycleStatus)
    : undefined;
}

export function getLifecycleStatusLabel(value?: number | string) {
  const normalized = normalizeLifecycleStatus(value);
  return normalized ? $t(lifecycleStatusLocaleKeys[normalized]) : '-';
}

export const LifecycleStatusOptions = () =>
  lifecycleStatusKeys.map((value) => ({
    label: $t(lifecycleStatusLocaleKeys[value]),
    value,
  }));

export const LifecycleStatusDisplayOptions = () => [
  ...LifecycleStatusOptions(),
  ...Object.entries(LegacyLifecycleStatusMap).map(([value, status]) => ({
    label: $t(lifecycleStatusLocaleKeys[status]),
    value: Number(value),
  })),
];

/**
 * 获取租户列表（支持名称模糊搜索）
 */
async function getTenantList(params?: Recordable<any>) {
  return requestClient.get<ApiType.ListResponse<SystemTenantApi.SystemTenant>>(
    '/tenants',
    { params },
  );
}

/**
 * 获取租户详情
 */
async function getTenant(id: number) {
  return requestClient.get<SystemTenantApi.SystemTenant>(`/platform/v1/tenants/${id}`);
}

/**
 * 创建租户（原子开通）
 */
async function createTenant(data: {
  tenant: Omit<SystemTenantApi.SystemTenant, 'id' | 'createdAt' | 'updatedAt'>;
  operatorId: number;
  initialAdmin: SystemTenantApi.TenantInitialAdmin;
}) {
  return requestClient.post('/platform/v1/tenants', data);
}

/**
 * 更新租户基本信息
 */
async function updateTenant(
  id: number,
  data: { tenant: Partial<SystemTenantApi.SystemTenant>; operatorId: number },
) {
  return requestClient.put(`/platform/v1/tenants/${id}`, data.tenant, {
    params: { operatorId: data.operatorId },
  });
}

/**
 * 删除租户
 */
async function deleteTenant(id: number) {
  return requestClient.delete(`/platform/v1/tenants/${id}`, { data: { operatorId: 1 } });
}

/**
 * 更新租户生命周期状态
 */
async function updateTenantLifecycle(
  id: number,
  lifecycleStatus: TenantLifecycleStatus,
  operatorId: number = 1,
) {
  return requestClient.put(`/platform/v1/tenants/${id}/lifecycle`, {
    lifecycleStatus,
    operatorId,
  });
}

async function getTenantAdmins(tenantId: number) {
  return requestClient.get<{ items: SystemTenantApi.TenantAdmin[] }>(
    `/platform/v1/tenants/${tenantId}/admins`,
  );
}

async function updateTenantAdmin(
  tenantId: number,
  adminUserId: number,
  data: { email?: string; phone?: string; realname?: string },
) {
  return requestClient.put(`/platform/v1/tenants/${tenantId}/admins/${adminUserId}`, {
    ...data,
    adminUserId,
    operatorId: 1,
    tenantId,
  });
}

async function resetTenantAdminPassword(
  tenantId: number,
  adminUserId: number,
  newPassword: string,
) {
  return requestClient.post(
    `/platform/v1/tenants/${tenantId}/admins/${adminUserId}:reset-password`,
    { adminUserId, newPassword, operatorId: 1, tenantId },
  );
}

export {
  createTenant,
  deleteTenant,
  getTenantAdmins,
  getTenant,
  getTenantList,
  updateTenant,
  updateTenantAdmin,
  updateTenantLifecycle,
  resetTenantAdminPassword,
};

/**
 * 公开搜索租户
 */
export async function searchTenantsByName(params?: Recordable<any>) {
  return requestClient.get<{ items: SystemTenantApi.SystemTenant[] }>(
    '/platform/v1/tenants/simples',
    { params },
  );
}
