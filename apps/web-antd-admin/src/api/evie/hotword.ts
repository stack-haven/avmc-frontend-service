import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface Hotword {
  id?: number;
  word: string;
  target?: string;
  weight?: number;
  category?: string;
  createdAt?: string;
}

export const getHotwordList = (params?: Recordable<any>) =>
  requestClient.get<{ hotwords: Hotword[] }>('/evie/v1/hotwords', { params });

export const upsertHotword = (data: Hotword) =>
  requestClient.post<{ hotword: Hotword }>('/evie/v1/hotwords', data);

export const deleteHotword = (id: number) => requestClient.delete(`/evie/v1/hotwords/${id}`);
