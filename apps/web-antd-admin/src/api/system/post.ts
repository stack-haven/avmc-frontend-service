import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace SystemPostApi {
  export interface SystemPost {
    id: string;
    name: string;
    status?: string;
    sort?: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
  }
}

/**
 * 获取岗位列表
 */
async function getPostList(params?: Recordable<any>) {
  return requestClient.get<ApiType.ListResponse<SystemPostApi.SystemPost>>(
    '/posts',
    { params },
  );
}

/**
 * 获取岗位详情
 */
async function getPost(id: string) {
  return requestClient.get<SystemPostApi.SystemPost>(`/platform/v1/posts/${id}`);
}

/**
 * 创建岗位
 */
async function createPost(data: SystemPostApi.SystemPost) {
  return requestClient.post('/platform/v1/posts', data);
}

/**
 * 更新岗位
 */
async function updatePost(id: string, data: SystemPostApi.SystemPost) {
  return requestClient.put(`/platform/v1/posts/${id}`, data);
}

/**
 * 删除岗位
 */
async function deletePost(id: string) {
  return requestClient.delete(`/platform/v1/posts/${id}`);
}

export { createPost, deletePost, getPost, getPostList, updatePost };
