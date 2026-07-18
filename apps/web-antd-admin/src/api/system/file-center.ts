import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace FileCenterApi {
  export type FileStatus = 1 | 2 | 3;

  export interface FileObject {
    bucket?: string;
    businessId?: string;
    businessType?: string;
    contentType?: string;
    createdAt?: string;
    createdBy?: number;
    deletedAt?: string;
    fileName?: string;
    id: number;
    objectKey?: string;
    provider?: string;
    providerCode?: string;
    providerId?: number;
    sha256?: string;
    size?: number;
    status?: FileStatus;
    tenantId?: number;
    updatedAt?: string;
    uploadExpiresAt?: string;
    visibility?: string;
  }

  export interface FileAccessLog {
    action?: string;
    clientIp?: string;
    createdAt?: string;
    fileId: number;
    fileName?: string;
    id: number;
    message?: string;
    operatorId?: number;
    operatorName?: string;
    result?: string;
    tenantId?: number;
    userAgent?: string;
  }
}

export const getFileObjectList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<FileCenterApi.FileObject>>('/files', {
    params,
  });

export const getFileObject = (id: number) =>
  requestClient.get<FileCenterApi.FileObject>(`/files/${id}`);

export const getFileAccessLogList = (id: number, params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<FileCenterApi.FileAccessLog>>(
    `/files/${id}/access-logs`,
    { params },
  );

export const presignFileDownload = (id: number) =>
  requestClient.get<{ downloadUrl: string; expiresAt: string }>(
    `/files/${id}:download-url`,
  );

export const deleteFileObject = (id: number, idempotencyKey?: string) =>
  requestClient.delete(`/files/${id}`, {
    params: { idempotencyKey },
  });
