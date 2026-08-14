import { requestClient } from '#/api/request';

export interface ProviderInfo {
  name: string;
  deploymentMode: string;
  streaming: boolean;
  supportedFormats: string[];
  sampleRates: number[];
  hotwordSupport: boolean;
}

export interface TenantProviderConfig {
  providerName: string;
  isActive: boolean;
  configJson: string;
  sampleRate: number;
  language: string;
}

export const getAvailableProviders = () =>
  requestClient.get<{ providers: ProviderInfo[] }>('/evie/v1/providers/available');

export const getTenantProviderConfig = () =>
  requestClient.get<{ configs: TenantProviderConfig[] }>('/evie/v1/providers/config');

export const updateTenantProviderConfig = (config: TenantProviderConfig) =>
  requestClient.put<{ config: TenantProviderConfig }>('/evie/v1/providers/config', config);
