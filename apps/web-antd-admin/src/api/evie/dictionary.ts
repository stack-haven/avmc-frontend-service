import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

// ============ 词库中心（Dictionary Center） ============

export interface Dictionary {
  id?: number;
  name: string;
  scope?: string;
  source?: string;
  description?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DictionaryEntry {
  id?: number;
  dictionaryId?: number;
  standardText: string;
  entryType?: string;
  category?: string;
  description?: string;
  source?: string;
  sourceId?: string;
  priority?: number;
  pinyin?: string;
  pinyinInitial?: string;
  normalizedText?: string;
  status?: number;
  createdAt?: string;
}

export interface DictionaryRelation {
  id?: number;
  entryId?: number;
  relationType?: string;
  relatedText?: string;
  targetEntryId?: number;
  source?: string;
  description?: string;
  status?: number;
  createdAt?: string;
}

export interface DictionaryCategory {
  id?: number;
  code: string;
  name: string;
  builtin?: boolean;
  sort?: number;
  status?: number;
  createdAt?: string;
}

export interface DictionaryVersion {
  id?: number;
  dictionaryId?: number;
  versionNo?: number;
  snapshot?: string;
  description?: string;
  status?: number;
  createdAt?: string;
}

export interface DictionaryConflict {
  id?: number;
  input?: string;
  candidate?: string;
  sourceScope?: string;
  sourceDictionary?: string;
  priority?: number;
  resolvedCandidate?: string;
  createdAt?: string;
}

// ---------- 词库 ----------
export const getDictionaryList = (params?: Recordable<any>) =>
  requestClient.get<{ dictionaries: Dictionary[]; total: number }>(
    '/evie/v1/dictionaries',
    { params },
  );

export const getDictionary = (id: number) =>
  requestClient.get<Dictionary>(`/evie/v1/dictionaries/${id}`);

export const createDictionary = (data: Dictionary) =>
  requestClient.post<Dictionary>('/evie/v1/dictionaries', data);

export const updateDictionary = (id: number, data: Dictionary) =>
  requestClient.put<Dictionary>(`/evie/v1/dictionaries/${id}`, data);

export const deleteDictionary = (id: number) =>
  requestClient.delete(`/evie/v1/dictionaries/${id}`);

// ---------- 词条 ----------
export const getEntryList = (dictionaryId = 0, params?: Recordable<any>) =>
  requestClient.get<{ entries: DictionaryEntry[]; total: number }>(
    `/evie/v1/dictionaries/${dictionaryId}/entries`,
    { params },
  );

export const getEntry = (id: number) =>
  requestClient.get<DictionaryEntry>(`/evie/v1/entries/${id}`);

export const createEntry = (dictionaryId: number, data: DictionaryEntry) =>
  requestClient.post<DictionaryEntry>(
    `/evie/v1/dictionaries/${dictionaryId}/entries`,
    data,
  );

export const updateEntry = (id: number, data: DictionaryEntry) =>
  requestClient.put<DictionaryEntry>(`/evie/v1/entries/${id}`, data);

export const deleteEntry = (id: number) =>
  requestClient.delete(`/evie/v1/entries/${id}`);

// ---------- 关系 ----------
export const getRelationList = (entryId = 0, params?: Recordable<any>) =>
  requestClient.get<{ relations: DictionaryRelation[]; total: number }>(
    `/evie/v1/entries/${entryId}/relations`,
    { params },
  );

export const getRelation = (id: number) =>
  requestClient.get<DictionaryRelation>(`/evie/v1/relations/${id}`);

export const createRelation = (entryId: number, data: DictionaryRelation) =>
  requestClient.post<DictionaryRelation>(
    `/evie/v1/entries/${entryId}/relations`,
    data,
  );

export const updateRelation = (id: number, data: DictionaryRelation) =>
  requestClient.put<DictionaryRelation>(`/evie/v1/relations/${id}`, data);

export const deleteRelation = (id: number) =>
  requestClient.delete(`/evie/v1/relations/${id}`);

// ---------- 分类 ----------
export const getCategoryList = (params?: Recordable<any>) =>
  requestClient.get<{ categories: DictionaryCategory[]; total: number }>(
    '/evie/v1/dictionary-categories',
    { params },
  );

export const createCategory = (data: DictionaryCategory) =>
  requestClient.post<DictionaryCategory>('/evie/v1/dictionary-categories', data);

export const updateCategory = (id: number, data: DictionaryCategory) =>
  requestClient.put<DictionaryCategory>(
    `/evie/v1/dictionary-categories/${id}`,
    data,
  );

export const deleteCategory = (id: number) =>
  requestClient.delete(`/evie/v1/dictionary-categories/${id}`);

// ---------- 版本 ----------
export const getVersionList = (dictionaryId = 0, params?: Recordable<any>) =>
  requestClient.get<{ versions: DictionaryVersion[]; total: number }>(
    `/evie/v1/dictionaries/${dictionaryId}/versions`,
    { params },
  );

export const getVersion = (id: number) =>
  requestClient.get<DictionaryVersion>(`/evie/v1/dictionary-versions/${id}`);

export const publishDictionary = (
  dictionaryId: number,
  description?: string,
) =>
  requestClient.post<DictionaryVersion>(
    `/evie/v1/dictionaries/${dictionaryId}:publish`,
    { description },
  );

// ---------- 冲突 ----------
export const getConflictList = (params?: Recordable<any>) =>
  requestClient.get<{ conflicts: DictionaryConflict[]; total: number }>(
    '/evie/v1/dictionary-conflicts',
    { params },
  );

// ---------- 词库统计 (Backend-0 P0) ----------
export interface DictionaryStats {
  dictionaryId?: number;
  entryCount?: number;
  enabledEntryCount?: number;
  relationCount?: number;
  versionCount?: number;
  unresolvedConflictCount?: number;
  hitRate?: number;
  avgRecognitionConfidence?: number;
  lastModifiedAt?: string;
}

export const getDictionaryStats = (dictionaryId: number) =>
  requestClient.get<{ stats: DictionaryStats }>(
    `/evie/v1/dictionaries/${dictionaryId}:stats`,
  );

// ---------- 词库级别关系列表 (Backend-0 P0) ----------
export const listRelationsByDictionary = (
  dictionaryId: number,
  params?: Recordable<any>,
) =>
  requestClient.get<{ relations: DictionaryRelation[]; total: number }>(
    `/evie/v1/dictionaries/${dictionaryId}/relations`,
    { params },
  );

// ---------- 工作台总览 (Backend-1) ----------
export interface DashboardMyDictionary {
  id?: number;
  name?: string;
  scope?: string;
  entryCount?: number;
  relationCount?: number;
  unresolvedConflictCount?: number;
  lastModifiedAt?: string;
}

export interface DashboardSystemDictionary {
  id?: number;
  name?: string;
  scope?: string;
  entryCount?: number;
  lastModifiedAt?: string;
}

export interface DashboardActivity {
  id?: number;
  type?: string;
  title?: string;
  summary?: string;
  actorId?: number;
  targetType?: string;
  targetId?: number;
  targetLabel?: string;
  scope?: string;
  createdAt?: string;
}

export interface DashboardHealthSummary {
  totalDictionaries?: number;
  totalEntries?: number;
  enabledEntries?: number;
  totalRelations?: number;
  unresolvedConflicts?: number;
  hitRate?: number;
  avgRecognitionConfidence?: number;
  coverageDictionaryCount?: number;
  totalDictionaryCount?: number;
}

export interface DashboardOverview {
  myDictionaries?: DashboardMyDictionary[];
  systemDictionaries?: DashboardSystemDictionary[];
  health?: DashboardHealthSummary;
  recentActivities?: DashboardActivity[];
}

export const getDashboardOverview = (params?: { activitiesLimit?: number }) =>
  requestClient.get<{ overview: DashboardOverview }>('/evie/v1/dashboard', {
    params,
  });

// ---------- 词库健康度详细 (Backend-1) ----------
export interface VocabularyHealthDetail {
  dictionaryId?: number;
  dictionaryName?: string;
  entryCount?: number;
  relationCount?: number;
  hitRate?: number;
  avgRecognitionConfidence?: number;
  sampleCount?: number;
}

export const getVocabularyHealth = (params?: {
  dictionaryScope?: string;
  recentDays?: number;
}) =>
  requestClient.get<{ details: VocabularyHealthDetail[] }>(
    '/evie/v1/vocabulary-health',
    { params },
  );

// ---------- 拼音生成 (Backend-0 P0) ----------
// 已迁移到 ./pinyin.ts：后端 EnhancementService.GeneratePinyin 由 pkg/pinyin 实现。
// import { generatePinyin } from './pinyin';
