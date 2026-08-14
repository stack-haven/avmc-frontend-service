<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Table } from 'ant-design-vue';

import { getFileAccessLogList } from '#/api';
import { $t } from '#/locales';

import { accessLogColumns } from '../data';

const file = ref<FileCenterApi.FileObject>();
const logs = ref<FileCenterApi.FileAccessLog[]>([]);
const loading = ref(false);

const [Modal, modalApi] = useVbenModal({
  onOpenChange(open) {
    if (!open) return;
    const row = modalApi.getData<FileCenterApi.FileObject>();
    file.value = row;
    if (row?.id) {
      loadLogs(row.id);
    }
  },
});

async function loadLogs(fileId: number) {
  loading.value = true;
  try {
    const result = await getFileAccessLogList(fileId, { pageSize: 50, pageToken: '0' });
    logs.value = result.items ?? [];
  } finally {
    loading.value = false;
  }
}

const title = computed(() =>
  file.value ? `${$t('system.fileCenter.accessLogs')} · ${file.value.fileName}` : $t('system.fileCenter.accessLogs'),
);
</script>

<template>
  <Modal :title="title" width="min(900px, calc(100vw - 32px))">
    <Table
      :columns="accessLogColumns"
      :data-source="logs"
      :loading="loading"
      :pagination="{ pageSize: 20, showSizeChanger: false }"
      row-key="id"
      size="small"
    />
  </Modal>
</template>
