import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';
import type { ApiType } from '../type';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;
    id: number;
    isTenantAdmin?: boolean;
    dataScope?: number;
    deptIds?: number[];
    menuIds?: number[];
    name: string;
    remark?: string;
    status: string;
  }
}

/**
 * 获取角色列表数据
 */

async function getRoleList(params?: Recordable<any>) {
  return requestClient.get<ApiType.ListResponse<SystemRoleApi.SystemRole>>('/roles', {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/roles', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: number,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  const role = { ...data };
  delete role.isTenantAdmin;
  return requestClient.put(`/roles/${id}`, {
    role,
    updateMask: Object.keys(role).join(','),
  });
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: number) {
  return requestClient.delete(`/roles/${id}`);
}

/**
 * 更新角色状态
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRoleStatus(
  id: number,
  data: Partial<SystemRoleApi.SystemRole>,
) {
  return requestClient.put(`/roles/status-update/${id}`, data);
}

export { createRole, deleteRole, getRoleList, updateRole, updateRoleStatus };
