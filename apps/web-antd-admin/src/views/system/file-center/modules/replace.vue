<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Upload } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';

import { replaceFileContent } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const replacing = ref(false);
const progress = ref(0);
const selectedFile = ref<File>();
const fileId = ref<number>();
const originalName = ref('');

const [Modal, modalApi] = useVbenModal({
  confirmText: $t('system.fileCenter.replace'),
  onConfirm() {
    handleReplace();
  },
  onOpenChange(open) {
    if (open) {
      const row = modalApi.getData<FileCenterApi.FileObject>();
      fileId.value = row?.id;
      originalName.value = row?.fileName ?? '';
    } else {
      selectedFile.value = undefined;
      progress.value = 0;
    }
  },
});

function beforeUpload(file: File) {
  selectedFile.value = file;
  return false;
}

const uploadProps: UploadProps = {
  accept: '*',
  beforeUpload,
  maxCount: 1,
  multiple: false,
};

async function handleReplace() {
  const file = selectedFile.value;
  if (!file) {
    message.warning($t('system.fileCenter.noFileSelected'));
    return;
  }
  if (!fileId.value) return;
  replacing.value = true;
  progress.value = 20;
  try {
    const base64 = await readFileAsBase64(file);
    progress.value = 70;
    await replaceFileContent(fileId.value, base64, {
      contentType: file.type || 'application/octet-stream',
    });
    progress.value = 100;
    message.success($t('system.fileCenter.replaceSuccess'));
    emits('success');
    modalApi.close();
  } catch (error: any) {
    message.error(error?.message ?? $t('system.fileCenter.uploadFailed'));
  } finally {
    replacing.value = false;
  }
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
</script>

<template>
  <Modal :title="$t('system.fileCenter.replaceTitle')">
    <div class="replace-shell">
      <p class="text-muted-foreground text-sm">
        {{ $t('system.fileCenter.replaceHint') }}
      </p>
      <p v-if="originalName" class="text-sm">
        {{ $t('system.fileCenter.fileName') }}：{{ originalName }}
      </p>

      <Upload.Dragger v-bind="uploadProps" :disabled="replacing">
        <p class="text-base font-medium">
          {{ $t('system.fileCenter.selectFile') }}
        </p>
        <p v-if="selectedFile" class="mt-1 text-sm">
          {{ selectedFile.name }}
          （{{ (selectedFile.size / 1024).toFixed(1) }} KB）
        </p>
      </Upload.Dragger>

      <div v-if="replacing" class="replace-progress">
        <div class="h-1.5 w-full overflow-hidden rounded bg-muted">
          <div
            class="h-full bg-primary transition-all"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span class="text-muted-foreground mt-1 text-xs">
          {{ $t('system.fileCenter.uploading') }} {{ progress }}%
        </span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.replace-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.replace-progress {
  display: flex;
  flex-direction: column;
}
</style>
