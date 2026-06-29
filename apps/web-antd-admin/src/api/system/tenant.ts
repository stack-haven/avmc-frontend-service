import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';
import type { SystemMenuPermissionGroupApi } from './menu-permission-group';

import { requestClient } from '#/api/request';

export namespace SystemTenantApi {
  export interface InitialAdmin {
    email?: string;
    password: string;
    realname?: string;
    username: string;
  }

  export interface SystemTenant {
    activatedAt?: string;
    cancelledAt?: string;
    code: string;
    createdAt?: string;
    expiresAt?: string;
    groupIds?: number[];
    groups?: SystemMenuPermissionGroupApi.MenuPermissionGroup[];
    id: string;
    lifecycleStatus?: number;
    name: string;
    remark?: string;
    sort?: number;
    status: string;
    suspendedAt?: string;
    updatedAt?: string;
  }
}

async function getTenantList(params?: Recordable<any>) {
  return requestClient.get<ApiType.ListResponse<SystemTenantApi.SystemTenant>>(
    '/tenants',
    {
      params,
    },
  );
}

async function getTenant(id: string) {
  return requestClient.get<SystemTenantApi.SystemTenant>(`/tenants/${id}`);
}

async function createTenant(
  tenant: Omit<SystemTenantApi.SystemTenant, 'id'>,
  initialAdmin: SystemTenantApi.InitialAdmin,
) {
  return requestClient.post('/tenants', { initialAdmin, tenant });
}

async function updateTenant(
  id: string,
  data: Omit<SystemTenantApi.SystemTenant, 'id'>,
) {
  return requestClient.put(`/tenants/${id}`, data);
}

async function deleteTenant(id: string) {
  return requestClient.delete(`/tenants/${id}`);
}

async function updateTenantStatus(
  id: string,
  data: Pick<SystemTenantApi.SystemTenant, 'status'>,
) {
  return requestClient.put(`/tenants/status-update/${id}`, data);
}

export {
  createTenant,
  deleteTenant,
  getTenant,
  getTenantList,
  updateTenant,
  updateTenantStatus,
};
