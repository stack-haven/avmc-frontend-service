import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DictionaryAlias {
  id?: number;
  alias: string;
  pinyin?: string;
  weight?: number;
  source?: string;
}

export interface DictionaryWord {
  id?: number;
  word: string;
  level?: string;
  category?: string;
  source?: string;
  priority?: number;
  status?: number;
  aliases?: DictionaryAlias[];
  createdAt?: string;
}

export const getDictionaryWordList = (params?: Recordable<any>) =>
  requestClient.get<{ words: DictionaryWord[]; total: number }>('/evie/v1/dictionary/words', {
    params,
  });

export const getDictionaryWord = (id: number) =>
  requestClient.get<{ word: DictionaryWord }>(`/evie/v1/dictionary/words/${id}`);

export const createDictionaryWord = (data: DictionaryWord) =>
  requestClient.post<{ word: DictionaryWord }>('/evie/v1/dictionary/words', data);

export const updateDictionaryWord = (id: number, data: DictionaryWord) =>
  requestClient.put<{ word: DictionaryWord }>(`/evie/v1/dictionary/words/${id}`, data);

export const deleteDictionaryWord = (id: number) =>
  requestClient.delete(`/evie/v1/dictionary/words/${id}`);
