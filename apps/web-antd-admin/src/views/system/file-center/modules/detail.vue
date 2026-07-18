<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Table } from 'ant-design-vue';

import { getFileAccessLogList, getFileObject } from '#/api';
import { $t } from '#/locales';

import {
  accessLogColumns,
  fileStatusOptions,
  formatBytes,
  visibilityOptions,
} from '../data';

const file = ref<FileCenterApi.FileObject>();
const logs = ref<FileCenterApi.FileAccessLog[]>([]);
const loading = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) {
    if (!open) return;
    const row = drawerApi.getData<FileCenterApi.FileObject>();
    if (!row?.id) return;
    loading.value = true;
    try {
      file.value = await getFileObject(row.id);
      const result = await getFileAccessLogList(row.id, { pageSize: 20, pageToken: '0' });
      logs.value = result.items ?? [];
    } finally {
      loading.value = false;
    }
  },
});

const statusLabel = computed(() =>
  fileStatusOptions().find((item) => item.value === file.value?.status)?.label ?? file.value?.status,
);

const visibilityLabel = computed(() =>
  visibilityOptions().find((item) => item.value === file.value?.visibility)?.label ?? file.value?.visibility,
);
</script>

<template>
  <Drawer :title="$t('system.fileCenter.detail')" class="w-[720px]">
    <Descriptions v-if="file" bordered :column="1" size="small">
      <DescriptionsItem :label="$t('system.fileCenter.fileName')">
        {{ file.fileName }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.contentType')">
        {{ file.contentType }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.size')">
        {{ formatBytes(file.size || 0) }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.status')">
        {{ statusLabel }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.visibility')">
        {{ visibilityLabel }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.provider')">
        {{ file.providerCode || file.provider }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.bucket')">
        {{ file.bucket }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.objectKey')">
        {{ file.objectKey }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.business')">
        {{ file.businessType || '-' }} / {{ file.businessId || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.sha256')">
        {{ file.sha256 || '-' }}
      </DescriptionsItem>
      <DescriptionsItem :label="$t('system.fileCenter.createdAt')">
        {{ file.createdAt }}
      </DescriptionsItem>
    </Descriptions>

    <div class="mt-4 text-base font-medium">
      {{ $t('system.fileCenter.accessLogs') }}
    </div>
    <Table
      class="mt-2"
      :columns="accessLogColumns"
      :data-source="logs"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    />
  </Drawer>
</template>
