<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Switch, Tag, message } from 'ant-design-vue';

import type { ProviderInfo, TenantProviderConfig } from '#/api';
import { getAvailableProviders, getTenantProviderConfig, updateTenantProviderConfig } from '#/api';
import { $t } from '#/locales';

const providers = ref<ProviderInfo[]>([]);
const configs = ref<TenantProviderConfig[]>([]);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const [p, c] = await Promise.all([getAvailableProviders(), getTenantProviderConfig()]);
    providers.value = p.providers;
    configs.value = c.configs;
  } finally {
    loading.value = false;
  }
}

async function toggle(providerName: string, isActive: boolean) {
  const existing = configs.value.find((c) => c.providerName === providerName);
  const config: TenantProviderConfig = {
    providerName,
    isActive,
    configJson: existing?.configJson || '{}',
    sampleRate: existing?.sampleRate || 16000,
    language: existing?.language || 'zh',
  };
  await updateTenantProviderConfig(config);
  message.success($t('common.success'));
  await load();
}

onMounted(load);
</script>

<template>
  <Page auto-content-height :loading="loading">
    <div class="p-4">
      <div class="mb-4 text-base font-semibold">{{ $t('evie.provider.list') }}</div>
      <div class="space-y-3">
        <div v-for="p in providers" :key="p.name" class="flex items-center justify-between rounded-md border p-3">
          <div>
            <div class="font-medium">{{ p.name }}</div>
            <div class="text-muted-foreground text-sm">
              {{ p.deploymentMode }}
              <Tag color="blue" v-if="p.streaming">streaming</Tag>
              <Tag color="green" v-if="p.hotwordSupport">hotword</Tag>
            </div>
            <div class="text-muted-foreground text-xs">formats: {{ p.supportedFormats.join(', ') }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm">{{ $t('evie.provider.isActive') }}</span>
            <Switch
              :checked="configs.some((c) => c.providerName === p.name && c.isActive)"
              @change="(v: any) => toggle(p.name, v)"
            />
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
