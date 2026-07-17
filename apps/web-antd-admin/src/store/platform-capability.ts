import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

import type { PlatformCapabilityApi } from '#/api/system/platform-capability';

import {
  getCurrentTenantCapabilities,
  listCurrentTenantResourceQuotas,
} from '#/api/system/platform-capability';

export const usePlatformCapabilityStore = defineStore(
  'platform-capability',
  () => {
    const capabilities =
      ref<null | PlatformCapabilityApi.CurrentTenantCapabilities>(null);
    const quotaUsages = ref<PlatformCapabilityApi.TenantResourceQuotaUsage[]>(
      [],
    );
    const loading = ref(false);
    const quotaLoading = ref(false);
    const fetched = ref(false);

    const apiPermissions = computed(
      () => capabilities.value?.apiPermissions ?? [],
    );
    const featureFlags = computed(
      () => capabilities.value?.featureFlags ?? {},
    );
    const resourceQuotas = computed(
      () => capabilities.value?.resourceQuotas ?? {},
    );

    async function refreshCapabilities() {
      loading.value = true;
      try {
        capabilities.value = await getCurrentTenantCapabilities();
        fetched.value = true;
        return capabilities.value;
      } finally {
        loading.value = false;
      }
    }

    async function refreshResourceQuotas() {
      quotaLoading.value = true;
      try {
        const result = await listCurrentTenantResourceQuotas();
        quotaUsages.value = result.items ?? [];
        return quotaUsages.value;
      } finally {
        quotaLoading.value = false;
      }
    }

    function hasApiPermission(permission: string) {
      return apiPermissions.value.includes(permission);
    }

    function hasFeature(featureKey: string) {
      return featureFlags.value[featureKey] === true;
    }

    function getQuotaLimit(resourceKey: string) {
      return resourceQuotas.value[resourceKey];
    }

    function getQuotaUsage(resourceKey: string) {
      return quotaUsages.value.find(
        (item) => item.resourceKey === resourceKey,
      );
    }

    function canConsumeCached(resourceKey: string, amount: number) {
      const usage = getQuotaUsage(resourceKey);
      if (usage?.unlimited) {
        return true;
      }
      const limit = usage?.limit ?? getQuotaLimit(resourceKey);
      if (limit === undefined) {
        return true;
      }
      const used = usage?.used ?? 0;
      return used + amount <= limit;
    }

    function $reset() {
      capabilities.value = null;
      quotaUsages.value = [];
      loading.value = false;
      quotaLoading.value = false;
      fetched.value = false;
    }

    return {
      $reset,
      apiPermissions,
      canConsumeCached,
      capabilities,
      featureFlags,
      fetched,
      getQuotaLimit,
      getQuotaUsage,
      hasApiPermission,
      hasFeature,
      loading,
      quotaLoading,
      quotaUsages,
      refreshCapabilities,
      refreshResourceQuotas,
      resourceQuotas,
    };
  },
);
