import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SystemProjectApi {
  export interface SystemProject {
    [key: string]: any;
    code?: string;
    createdAt?: string;
    description?: string;
    id: string;
    memberIds?: number[];
    memberIdsText?: string;
    name: string;
    ownerId?: number;
    ownerName?: string;
    status: string;
    updatedAt?: string;
  }
}

async function getProjectList(params: Recordable<any>) {
  return requestClient.get<Array<SystemProjectApi.SystemProject>>('/platform/v1/projects', {
    params,
  });
}

async function createProject(data: Omit<SystemProjectApi.SystemProject, 'id'>) {
  return requestClient.post('/platform/v1/projects', data);
}

async function updateProject(
  id: string,
  data: Omit<SystemProjectApi.SystemProject, 'id'>,
) {
  return requestClient.put(`/platform/v1/projects/${id}`, data);
}

async function deleteProject(id: string) {
  return requestClient.delete(`/platform/v1/projects/${id}`);
}

async function updateProjectStatus(
  id: string,
  data: Pick<SystemProjectApi.SystemProject, 'status'>,
) {
  return requestClient.post(`/platform/v1/projects/${id}:status-update`, data);
}

export {
  createProject,
  deleteProject,
  getProjectList,
  updateProject,
  updateProjectStatus,
};
