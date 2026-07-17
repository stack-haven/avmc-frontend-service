import { requestClient } from '#/api/request';

export namespace PlatformCapabilityApi {
  export interface TenantPermissionGroupBinding {
    autoUpgrade?: boolean;
    enabled?: boolean;
    groupId: number;
    tenantId: number;
    version?: number;
    versionId?: number;
  }

  export interface CurrentTenantCapabilities {
    apiPermissions?: string[];
    bindings?: TenantPermissionGroupBinding[];
    featureFlags?: Record<string, boolean>;
    groupIds?: number[];
    resourceQuotas?: Record<string, number>;
    tenantId: number;
  }

  export interface TenantResourceQuotaUsage {
    limit: number;
    remaining: number;
    resourceKey: string;
    tenantId: number;
    unlimited?: boolean;
    updatedAt?: string;
    used: number;
  }

  export interface ResourceQuotaCheck {
    allowed: boolean;
    usage?: TenantResourceQuotaUsage;
  }

  export interface ResourceQuotaUsageResponse {
    usage?: TenantResourceQuotaUsage;
  }
}

function encodeResourceKey(resourceKey: string) {
  return encodeURIComponent(resourceKey);
}

async function getCurrentTenantCapabilities() {
  return requestClient.get<PlatformCapabilityApi.CurrentTenantCapabilities>(
    '/current-tenant/capabilities',
  );
}

async function listCurrentTenantResourceQuotas() {
  return requestClient.get<{
    items: PlatformCapabilityApi.TenantResourceQuotaUsage[];
  }>('/current-tenant/resource-quotas');
}

async function checkCurrentTenantResourceQuota(
  resourceKey: string,
  amount: number,
) {
  return requestClient.get<PlatformCapabilityApi.ResourceQuotaCheck>(
    `/current-tenant/resource-quotas/${encodeResourceKey(resourceKey)}:check`,
    { params: { amount } },
  );
}

async function consumeCurrentTenantResourceQuota(
  resourceKey: string,
  amount: number,
  idempotencyKey?: string,
) {
  return requestClient.post<PlatformCapabilityApi.ResourceQuotaUsageResponse>(
    `/current-tenant/resource-quotas/${encodeResourceKey(resourceKey)}:consume`,
    { amount, idempotencyKey, resourceKey },
  );
}

async function releaseCurrentTenantResourceQuota(
  resourceKey: string,
  amount: number,
  idempotencyKey?: string,
) {
  return requestClient.post<PlatformCapabilityApi.ResourceQuotaUsageResponse>(
    `/current-tenant/resource-quotas/${encodeResourceKey(resourceKey)}:release`,
    { amount, idempotencyKey, resourceKey },
  );
}

export {
  checkCurrentTenantResourceQuota,
  consumeCurrentTenantResourceQuota,
  getCurrentTenantCapabilities,
  listCurrentTenantResourceQuotas,
  releaseCurrentTenantResourceQuota,
};
