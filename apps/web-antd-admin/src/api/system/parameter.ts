import type { Recordable } from '@vben/types';

import type { ApiType } from '../type';

import { requestClient } from '#/api/request';

export namespace ParameterApi {
  export type ValueType =
    | 'PARAMETER_VALUE_TYPE_BOOLEAN'
    | 'PARAMETER_VALUE_TYPE_INTEGER'
    | 'PARAMETER_VALUE_TYPE_JSON'
    | 'PARAMETER_VALUE_TYPE_STRING';

  export type ValueSource =
    | 'PARAMETER_VALUE_SOURCE_PLATFORM_DEFAULT'
    | 'PARAMETER_VALUE_SOURCE_TENANT_OVERRIDE';

  export interface Definition {
    createdAt?: string;
    defaultValue: string;
    description?: string;
    id: number;
    key: string;
    name: string;
    sort?: number;
    status?: string;
    tenantOverridable: boolean;
    updatedAt?: string;
    valueType: ValueType;
  }

  export interface Resolved {
    definitionId: number;
    description?: string;
    key: string;
    name: string;
    source: ValueSource;
    tenantOverridable: boolean;
    updatedAt?: string;
    value: string;
    valueType: ValueType;
  }
}

export const getParameterDefinitionList = (params?: Recordable<any>) =>
  requestClient.get<ApiType.ListResponse<ParameterApi.Definition>>(
    '/parameters/definitions',
    { params },
  );

export const getParameterDefinition = async (id: number) => {
  const result = await requestClient.get<{ parameter: ParameterApi.Definition }>(
    `/parameters/definitions/${id}`,
  );
  return result.parameter;
};

export const createParameterDefinition = async (
  data: Omit<ParameterApi.Definition, 'id'>,
) => {
  const result = await requestClient.post<{
    parameter: ParameterApi.Definition;
  }>('/parameters/definitions', data);
  return result.parameter;
};

export const updateParameterDefinition = async (
  id: number,
  data: Omit<ParameterApi.Definition, 'id'>,
) => {
  const result = await requestClient.put<{
    parameter: ParameterApi.Definition;
  }>(`/parameters/definitions/${id}`, data);
  return result.parameter;
};

export const deleteParameterDefinition = (id: number) =>
  requestClient.delete(`/parameters/definitions/${id}`);

export const getCurrentTenantParameters = (params?: { key?: string }) =>
  requestClient.get<{ items: ParameterApi.Resolved[] }>('/parameters/current', {
    params,
  });

export const setCurrentTenantParameter = async (key: string, value: string) => {
  const result = await requestClient.put<{ parameter: ParameterApi.Resolved }>(
    `/parameters/current/${encodeURIComponent(key)}`,
    { key, value },
  );
  return result.parameter;
};

export const resetCurrentTenantParameter = (key: string) =>
  requestClient.delete(`/parameters/current/${encodeURIComponent(key)}`);
