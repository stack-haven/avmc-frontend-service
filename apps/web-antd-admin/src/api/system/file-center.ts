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
    `/files/${id}/download-url`,
  );

export const deleteFileObject = (id: number, idempotencyKey?: string) =>
  requestClient.delete(`/files/${id}`, {
    params: { idempotencyKey },
  });

export interface CreateUploadSessionParams {
  businessId?: string;
  businessType?: string;
  contentType?: string;
  fileName: string;
  idempotencyKey?: string;
  partSize?: number;
  sha256?: string;
  size: number;
  totalParts?: number;
  visibility?: string;
}

export interface FilePartInfo {
  etag: string;
  partNumber: number;
}

export interface UploadSession {
  expiresAt?: string;
  file?: FileCenterApi.FileObject;
  uploadMethod?: string;
  uploadUrl?: string;
}

export const createFileUploadSession = (data: CreateUploadSessionParams) =>
  requestClient.post<UploadSession>('/files/upload-sessions', data);

export const uploadFileContent = (
  id: number,
  content: string,
  contentType?: string,
) =>
  requestClient.post<{ file: FileCenterApi.FileObject }>(`/files/${id}/content`, {
    content,
    contentType,
  });

export const confirmFileUpload = (
  id: number,
  data?: { etag?: string; sha256?: string; size?: number },
) =>
  requestClient.post<{ file: FileCenterApi.FileObject }>(`/files/${id}/confirm`, data);

export const updateFileObject = (id: number, fileName: string) =>
  requestClient.put<{ file: FileCenterApi.FileObject }>(`/files/${id}`, {
    fileName,
  });

export const replaceFileContent = (
  id: number,
  content: string,
  data?: { contentType?: string; fileName?: string },
) =>
  requestClient.post<{ file: FileCenterApi.FileObject }>(`/files/${id}/replace`, {
    content,
    ...data,
  });

export const downloadFileContent = (id: number) =>
  requestClient.get<{
    content: string;
    contentType?: string;
    fileName?: string;
  }>(`/files/${id}/download`);

export const uploadFilePart = (
  id: number,
  partNumber: number,
  content: string,
) =>
  requestClient.put<{ etag: string; partNumber: number }>(`/files/${id}/parts`, {
    content,
    partNumber,
  });

export const listFileParts = (id: number) =>
  requestClient.get<{
    partSize: number;
    parts: FilePartInfo[];
    totalParts: number;
  }>(`/files/${id}/parts`);

export const completeFileUpload = (id: number, parts: FilePartInfo[]) =>
  requestClient.post<{ file: FileCenterApi.FileObject }>(`/files/${id}/complete`, {
    parts,
  });

export const abortFileUpload = (id: number) =>
  requestClient.post<{}>(`/files/${id}/abort`, {});
