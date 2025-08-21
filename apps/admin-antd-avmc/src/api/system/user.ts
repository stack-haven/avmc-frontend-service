import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;
    id: string;
    name: string;
    remark?: string;
    status: 0 | 1;
  }
}

/**
 * 获取角色列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>('/users', {
    params,
  });
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/users', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateUser(
  id: string,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/users/${id}`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteUser(id: string) {
  return requestClient.delete(`/users/${id}`);
}

export { createUser, deleteUser, getUserList, updateUser };
