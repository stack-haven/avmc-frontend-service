import { requestClient } from '#/api/request';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;
    children?: SystemDept[];
    directUserCount?: number;
    id: number;
    name: string;
    parentId?: number;
    remark?: string;
    status: 0 | 1;
    totalUserCount?: number;
  }

  export interface DeleteImpact {
    canDeleteDirectly: boolean;
    directUserCount: number;
    hasChildren: boolean;
    hasDataScopeRoles: boolean;
    id: number;
    isProtectedRoot: boolean;
    name: string;
    requiresUserTransfer: boolean;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptList() {
  return requestClient.get<{
    items: Array<SystemDeptApi.SystemDept>;
  }>('/depts/tree');
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/depts', data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: number,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/depts/${id}`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: number) {
  return requestClient.delete(`/depts/${id}`);
}

async function getDeptDeleteImpact(id: number) {
  return requestClient.get<SystemDeptApi.DeleteImpact>(
    `/depts/${id}/delete-impact`,
  );
}

async function transferAndDeleteDept(id: number, targetDeptId: number) {
  return requestClient.post<{ transferredUserCount: number }>(
    `/depts/${id}:transfer-and-delete`,
    { targetDeptId },
  );
}

export {
  createDept,
  deleteDept,
  getDeptDeleteImpact,
  getDeptList,
  transferAndDeleteDept,
  updateDept,
};
