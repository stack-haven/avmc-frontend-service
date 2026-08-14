<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Empty, Spin } from 'ant-design-vue';

import { downloadFileContent, presignFileDownload } from '#/api';
import { $t } from '#/locales';

import { formatBytes, isImage } from '../data';

const file = ref<FileCenterApi.FileObject>();
const imageUrl = ref('');
const loading = ref(false);
const failed = ref(false);

const [Modal, modalApi] = useVbenModal({
  footer: false,
  onOpenChange(open) {
    if (!open) {
      imageUrl.value = '';
      failed.value = false;
      return;
    }
    const row = modalApi.getData<FileCenterApi.FileObject>();
    file.value = row;
    if (row && isImage(row)) {
      loadPreview(row);
    }
  },
});

async function loadPreview(row: FileCenterApi.FileObject) {
  loading.value = true;
  failed.value = false;
  try {
    if (row.provider === 'local') {
      // 本地渠道：后端代理读取内容，转 blob URL
      const result = await downloadFileContent(row.id);
      imageUrl.value = base64ToBlobUrl(result.content, result.contentType);
    } else {
      // 对象存储渠道：预签名 URL
      const result = await presignFileDownload(row.id);
      if (result.downloadUrl) {
        imageUrl.value = result.downloadUrl;
      } else {
        failed.value = true;
      }
    }
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

function base64ToBlobUrl(base64: string, contentType?: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: contentType || 'application/octet-stream' });
  return URL.createObjectURL(blob);
}

const sizeText = computed(() => formatBytes(file.value?.size || 0));
</script>

<template>
  <Modal :title="$t('system.fileCenter.previewTitle')" width="min(960px, calc(100vw - 32px))">
    <div class="preview-shell">
      <Spin :spinning="loading" :tip="$t('system.fileCenter.previewLoading')">
        <div v-if="imageUrl && !failed" class="preview-image-wrap">
          <img
            :alt="file?.fileName"
            :src="imageUrl"
            class="preview-image"
            @error="failed = true"
          />
        </div>
        <Empty
          v-else-if="failed"
          :description="$t('system.fileCenter.previewFailed')"
        />
        <Empty
          v-else
          :description="$t('system.fileCenter.notPreviewable')"
        />
      </Spin>

      <div v-if="file" class="preview-meta">
        <span class="font-medium">{{ file.fileName }}</span>
        <span class="text-muted-foreground">{{ sizeText }}</span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.preview-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  overflow: auto;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background:
    repeating-conic-gradient(hsl(var(--muted) / 30%) 0% 25%, transparent 0% 50%)
    50% / 20px 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}
</style>
