import type { Recordable } from '@vben/types';
import type { ApiType } from '../type';
import { requestClient } from '#/api/request';

export namespace SystemDictionaryApi {
  export interface DictionaryItem {
    id: number;
    typeId: number;
    label: string;
    value: string;
    status?: string;
    sort?: number;
    color?: string;
    remark?: string;
  }
  export interface DictionaryType {
    id: number;
    name: string;
    code: string;
    status?: string;
    sort?: number;
    remark?: string;
    items?: DictionaryItem[];
    createdAt?: string;
  }
}
export const getDictionaryTypeList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<SystemDictionaryApi.DictionaryType>>('/dictionaries', { params });
export const getDictionaryType = (id: number) =>
  requestClient.get<SystemDictionaryApi.DictionaryType>(`/dictionaries/${id}`);
export const createDictionaryType = (data: Omit<SystemDictionaryApi.DictionaryType, 'id'>) =>
  requestClient.post<SystemDictionaryApi.DictionaryType>('/dictionaries', data);
export const updateDictionaryType = (id: number, data: Omit<SystemDictionaryApi.DictionaryType, 'id'>) =>
  requestClient.put<SystemDictionaryApi.DictionaryType>(`/dictionaries/${id}`, data);
export const deleteDictionaryType = (id: number) => requestClient.delete(`/dictionaries/${id}`);
export const createDictionaryItem = (data: Omit<SystemDictionaryApi.DictionaryItem, 'id'>) =>
  requestClient.post<SystemDictionaryApi.DictionaryItem>('/dictionary-items', data);
export const updateDictionaryItem = (id: number, data: Omit<SystemDictionaryApi.DictionaryItem, 'id'>) =>
  requestClient.put<SystemDictionaryApi.DictionaryItem>(`/dictionary-items/${id}`, data);
export const deleteDictionaryItem = (id: number) => requestClient.delete(`/dictionary-items/${id}`);

