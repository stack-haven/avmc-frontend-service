<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Descriptions, DescriptionsItem } from 'ant-design-vue';

import { getFileObject } from '#/api';
import { $t } from '#/locales';

import { fileStatusOptions, formatBytes, visibilityOptions } from '../data';

const file = ref<FileCenterApi.FileObject>();

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) {
    if (!open) return;
    const row = drawerApi.getData<FileCenterApi.FileObject>();
    if (!row?.id) return;
    file.value = await getFileObject(row.id);
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
  </Drawer>
</template>
