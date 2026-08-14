<script lang="ts" setup>
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { message, Upload } from 'ant-design-vue';
import type { UploadProps } from 'ant-design-vue';

import {
  completeFileUpload,
  confirmFileUpload,
  createFileUploadSession,
  listFileParts,
  uploadFileContent,
  uploadFilePart,
} from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const uploading = ref(false);
const progress = ref(0);
const selectedFile = ref<File>();

const [Modal, modalApi] = useVbenModal({
  confirmText: $t('system.fileCenter.upload'),
  onConfirm() {
    handleUpload();
  },
  onOpenChange(open) {
    if (!open) {
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

// 分片阈值：超过该大小（字节）走分片上传。
const MULTIPART_THRESHOLD = 5 * 1024 * 1024;
const PART_SIZE = 5 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 3;

async function handleUpload() {
  const file = selectedFile.value;
  if (!file) {
    message.warning($t('system.fileCenter.noFileSelected'));
    return;
  }
  uploading.value = true;
  progress.value = 10;
  try {
    const multipart = file.size > MULTIPART_THRESHOLD;
    const totalParts = multipart ? Math.ceil(file.size / PART_SIZE) : 0;
    // 幂等键：同一文件的重复上传复用同一会话，实现断点续传。
    const idempotencyKey = `${file.name}-${file.size}-${file.lastModified}`;

    const session = await createFileUploadSession({
      contentType: file.type || 'application/octet-stream',
      fileName: file.name,
      idempotencyKey,
      partSize: multipart ? PART_SIZE : 0,
      size: file.size,
      totalParts,
      visibility: 'private',
    });
    progress.value = 20;

    const fileId = session.file?.id;
    if (!fileId) {
      throw new Error($t('system.fileCenter.uploadFailed'));
    }

    if (session.uploadMethod === 'POST') {
      // 本地存储渠道：代理上传
      if (multipart) {
        await uploadLocalMultipart(fileId, file, totalParts);
      } else {
        const base64 = await readFileAsBase64(file);
        progress.value = 60;
        await uploadFileContent(fileId, base64, file.type);
        await confirmFileUpload(fileId, { size: file.size });
      }
    } else if (session.uploadUrl) {
      // 对象存储渠道：预签名 PUT（分片后续预留）
      progress.value = 60;
      await putFile(session.uploadUrl, file);
      await confirmFileUpload(fileId, { size: file.size });
    } else {
      throw new Error($t('system.fileCenter.uploadMethodUnsupported'));
    }

    progress.value = 100;
    message.success($t('system.fileCenter.uploadSuccess'));
    emits('success');
    modalApi.close();
  } catch (error: any) {
    message.error(error?.message ?? $t('system.fileCenter.uploadFailed'));
  } finally {
    uploading.value = false;
  }
}

// 本地渠道分片上传：断点续传 + 并发。
async function uploadLocalMultipart(
  fileId: number,
  file: File,
  totalParts: number,
) {
  // 1. 查询已上传分片（断点续传）
  const existing = await listFileParts(fileId);
  const parts: { etag: string; partNumber: number }[] = [...existing.parts];
  const uploaded = new Set(existing.parts.map((p) => p.partNumber));

  // 2. 未完成的分片序号
  const pending: number[] = [];
  for (let i = 1; i <= totalParts; i += 1) {
    if (!uploaded.has(i)) pending.push(i);
  }

  let doneCount = uploaded.size;
  const results = new Array<{ etag: string; partNumber: number }>();

  // 3. 并发池上传未完成分片
  if (pending.length > 0) {
    let nextIndex = 0;
    const worker = async () => {
      while (nextIndex < pending.length) {
        const partNumber = pending[nextIndex]!;
        nextIndex += 1;
        const start = (partNumber - 1) * PART_SIZE;
        const end = Math.min(start + PART_SIZE, file.size);
        const slice = file.slice(start, end);
        const base64 = await readFileAsBase64(slice);
        const result = await uploadFilePart(fileId, partNumber, base64);
        results.push({ etag: result.etag, partNumber });
        doneCount += 1;
        // 进度 20% → 90%
        progress.value = 20 + (doneCount / totalParts) * 70;
      }
    };
    const workerCount = Math.min(UPLOAD_CONCURRENCY, pending.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
  }

  // 4. 合并分片（已上传的 + 本次新传的）
  const allParts = [...parts, ...results].sort(
    (a, b) => a.partNumber - b.partNumber,
  );
  await completeFileUpload(fileId, allParts);
}

function readFileAsBase64(file: Blob): Promise<string> {
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

async function putFile(url: string, file: File) {
  const response = await fetch(url, {
    body: file,
    headers: file.type ? { 'Content-Type': file.type } : undefined,
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error(`${$t('system.fileCenter.uploadFailed')}: ${response.status}`);
  }
}
</script>

<template>
  <Modal :title="$t('system.fileCenter.uploadTitle')">
    <div class="upload-shell">
      <p class="text-muted-foreground text-sm">
        {{ $t('system.fileCenter.uploadHint') }}
      </p>

      <Upload.Dragger v-bind="uploadProps" :disabled="uploading">
        <p class="text-base font-medium">
          {{ $t('system.fileCenter.selectFile') }}
        </p>
        <p v-if="selectedFile" class="mt-1 text-sm">
          {{ selectedFile.name }}
          （{{ (selectedFile.size / 1024).toFixed(1) }} KB）
        </p>
      </Upload.Dragger>

      <div v-if="uploading" class="upload-progress">
        <div class="h-1.5 w-full overflow-hidden rounded bg-muted">
          <div
            class="h-full bg-primary transition-all"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span class="text-muted-foreground mt-1 text-xs">
          {{ progress < 90 ? $t('system.fileCenter.uploading') : $t('system.fileCenter.confirming') }}
          {{ progress }}%
        </span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.upload-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px 0;
}

.upload-progress {
  display: flex;
  flex-direction: column;
}
</style>
