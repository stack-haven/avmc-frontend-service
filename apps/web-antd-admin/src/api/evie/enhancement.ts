import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

// ============ 文本增强（Enhancement） ============

export interface EnhancementPolicy {
  id?: number;
  name: string;
  mode?: string;
  textCleaning?: boolean;
  fillerRemoval?: boolean;
  aliasResolution?: boolean;
  deterministicReplacement?: boolean;
  pinyinCorrection?: boolean;
  fuzzyMatching?: boolean;
  contextCorrection?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnhancementProfile {
  id?: number;
  policyId?: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface EnhancementLog {
  id?: number;
  requestId?: string;
  sessionId?: string;
  policyId?: number;
  policyMode?: string;
  contextVersion?: string;
  rawText?: string;
  enhancedText?: string;
  changesJson?: string;
  processingTimeMs?: number;
  cleaningTimeMs?: number;
  fillerTimeMs?: number;
  vocabMatchTimeMs?: number;
  aliasTimeMs?: number;
  deterministicTimeMs?: number;
  pinyinTimeMs?: number;
  fuzzyTimeMs?: number;
  contextTimeMs?: number;
  status?: number;
  errorMessage?: string;
  createdAt?: string;
}

// ---------- 策略 ----------
export const getPolicyList = (params?: Recordable<any>) =>
  requestClient.get<{ policies: EnhancementPolicy[]; total: number }>(
    '/evie/v1/enhancement-policies',
    { params },
  );

export const getPolicy = (id: number) =>
  requestClient.get<EnhancementPolicy>(`/evie/v1/enhancement-policies/${id}`);

export const createPolicy = (data: EnhancementPolicy) =>
  requestClient.post<EnhancementPolicy>('/evie/v1/enhancement-policies', data);

export const updatePolicy = (id: number, data: EnhancementPolicy) =>
  requestClient.put<EnhancementPolicy>(
    `/evie/v1/enhancement-policies/${id}`,
    data,
  );

export const deletePolicy = (id: number) =>
  requestClient.delete(`/evie/v1/enhancement-policies/${id}`);

// ---------- 场景 ----------
export const getProfileList = (params?: Recordable<any>) =>
  requestClient.get<{ profiles: EnhancementProfile[]; total: number }>(
    '/evie/v1/enhancement-profiles',
    { params },
  );

export const getProfile = (id: number) =>
  requestClient.get<EnhancementProfile>(`/evie/v1/enhancement-profiles/${id}`);

export const createProfile = (data: EnhancementProfile) =>
  requestClient.post<EnhancementProfile>('/evie/v1/enhancement-profiles', data);

export const updateProfile = (id: number, data: EnhancementProfile) =>
  requestClient.put<EnhancementProfile>(
    `/evie/v1/enhancement-profiles/${id}`,
    data,
  );

export const deleteProfile = (id: number) =>
  requestClient.delete(`/evie/v1/enhancement-profiles/${id}`);

// ---------- 增强记录 ----------
export const getLogList = (params?: Recordable<any>) =>
  requestClient.get<{ logs: EnhancementLog[]; total: number }>(
    '/evie/v1/enhancement-logs',
    { params },
  );

export const getLog = (id: number) =>
  requestClient.get<EnhancementLog>(`/evie/v1/enhancement-logs/${id}`);
