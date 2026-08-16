import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

import type { ApiType } from '../type';

export namespace SystemUserApi {
  export interface SystemUser {
    id: number;
    name: string;
    password?: string;
    nickname?: string;
    realname?: string;
    birthday?: string;
    gender?: string;
    phone?: string;
    email?: string;
    avatar?: string;
    status?: string;
    description?: string;
    deptId?: number;
    roleIds?: number[];
    isTenantAdmin?: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
}

export const getUserList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemUserApi.SystemUser>>('/platform/v1/users', {
    params,
  });

export const getUser = (id: number) =>
  requestClient.get<SystemUserApi.SystemUser>(`/platform/v1/users/${id}`);

export const createUser = (
  data: Omit<SystemUserApi.SystemUser, 'id' | 'isTenantAdmin'>,
) => requestClient.post('/platform/v1/users', data);

export const updateUser = (
  id: number,
  data: Partial<SystemUserApi.SystemUser>,
) => {
  const user = { ...data };
  delete user.id;
  delete user.isTenantAdmin;
  delete user.createdAt;
  delete user.updatedAt;
  return requestClient.put(`/platform/v1/users/${id}`, {
    updateMask: Object.keys(user).join(','),
    user,
  });
};

export const updateUserStatus = (id: number, status: string) =>
  requestClient.post(`/platform/v1/users/${id}:status-update`, { status });

export const deleteUser = (id: number) =>
  requestClient.delete(`/platform/v1/users/${id}`);
