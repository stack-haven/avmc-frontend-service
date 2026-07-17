import { storeToRefs } from 'pinia';

import { usePlatformCapabilityStore } from '#/store';

export type FeatureGateMode = 'all' | 'any';

function matchFeatureFlags(
  flags: string | string[],
  hasFeature: (featureKey: string) => boolean,
  mode: FeatureGateMode = 'all',
) {
  const keys = Array.isArray(flags) ? flags : [flags];
  if (keys.length === 0) {
    return true;
  }
  return mode === 'any'
    ? keys.some((key) => hasFeature(key))
    : keys.every((key) => hasFeature(key));
}

export function usePlatformCapability() {
  const capabilityStore = usePlatformCapabilityStore();
  const state = storeToRefs(capabilityStore);

  return {
    ...state,
    canConsumeCached: capabilityStore.canConsumeCached,
    checkQuota: capabilityStore.checkQuota,
    consumeQuota: capabilityStore.consumeQuota,
    getQuotaLimit: capabilityStore.getQuotaLimit,
    getQuotaUsage: capabilityStore.getQuotaUsage,
    hasApiPermission: capabilityStore.hasApiPermission,
    hasFeature: capabilityStore.hasFeature,
    matchFeatureFlags: (flags: string | string[], mode?: FeatureGateMode) =>
      matchFeatureFlags(flags, capabilityStore.hasFeature, mode),
    refreshCapabilities: capabilityStore.refreshCapabilities,
    refreshResourceQuotas: capabilityStore.refreshResourceQuotas,
    releaseQuota: capabilityStore.releaseQuota,
  };
}
