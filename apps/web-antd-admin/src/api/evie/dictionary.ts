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
export const getEntryList = (dictionaryId: number, params?: Recordable<any>) =>
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
export const getRelationList = (entryId: number, params?: Recordable<any>) =>
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
export const getVersionList = (dictionaryId: number, params?: Recordable<any>) =>
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
