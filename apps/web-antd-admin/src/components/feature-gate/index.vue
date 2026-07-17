<script setup lang="ts">
import { computed } from 'vue';

import type { FeatureGateMode } from '#/hooks/use-platform-capability';

import { usePlatformCapability } from '#/hooks/use-platform-capability';

defineOptions({ name: 'FeatureGate' });

const props = withDefaults(
  defineProps<{
    features: string | string[];
    mode?: FeatureGateMode;
  }>(),
  {
    mode: 'all',
  },
);

const { matchFeatureFlags } = usePlatformCapability();

const visible = computed(() => matchFeatureFlags(props.features, props.mode));
</script>

<template>
  <slot v-if="visible"></slot>
  <slot v-else name="fallback"></slot>
</template>
