<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button, Switch, Tag, message } from 'ant-design-vue';

import type { ProviderInfo, TenantProviderConfig } from '#/api';
import { getAvailableProviders, getTenantProviderConfig, updateTenantProviderConfig } from '#/api';
import { $t } from '#/locales';

import ConfigForm from './modules/config-form.vue';

const SettingIcon = createIconifyIcon('mdi:cog-outline');

const providers = ref<ProviderInfo[]>([]);
const configs = ref<TenantProviderConfig[]>([]);
const loading = ref(false);

const [ConfigDrawer, configDrawerApi] = useVbenDrawer({
  connectedComponent: ConfigForm,
  destroyOnClose: true,
});

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

function getConfig(providerName: string) {
  return configs.value.find((c) => c.providerName === providerName);
}

async function toggle(providerName: string, isActive: boolean) {
  const existing = getConfig(providerName);
  const config: TenantProviderConfig = {
    providerName,
    isActive,
    configJson: existing?.configJson || '{}',
    sampleRate: existing?.sampleRate || 16000,
    language: existing?.language || 'zh',
  };
  await updateTenantProviderConfig(config);
  message.success($t('ui.actionMessage.operationSuccess'));
  await load();
}

function openConfig(providerName: string) {
  configDrawerApi.setData({ providerName, config: getConfig(providerName) }).open();
}

onMounted(load);
</script>

<template>
  <Page auto-content-height :loading="loading">
    <ConfigDrawer @success="load" />
    <div class="p-4">
      <div class="mb-4 text-base font-semibold">{{ $t('evie.provider.list') }}</div>
      <div class="space-y-3">
        <div
          v-for="p in providers"
          :key="p.name"
          class="flex items-center justify-between rounded-md border p-3"
        >
          <div class="min-w-0 flex-1">
            <div class="font-medium">{{ p.name }}</div>
            <div class="text-muted-foreground text-sm">
              {{ p.deploymentMode }}
              <Tag color="blue" v-if="p.streaming">streaming</Tag>
              <Tag color="green" v-if="p.hotwordSupport">hotword</Tag>
            </div>
            <div class="text-muted-foreground text-xs">formats: {{ p.supportedFormats.join(', ') }}</div>
            <div class="mt-1 truncate text-xs text-muted-foreground" :title="getConfig(p.name)?.configJson">
              配置：{{ getConfig(p.name)?.configJson || '未配置' }}
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="text-sm">{{ $t('evie.provider.isActive') }}</span>
            <Switch
              :checked="configs.some((c) => c.providerName === p.name && c.isActive)"
              @change="(v: any) => toggle(p.name, v)"
            />
            <Button size="small" @click="openConfig(p.name)">
              <SettingIcon class="mr-1 size-4" />
              配置
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
