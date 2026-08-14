<script lang="ts" setup>
import type { FileCenterApi } from '#/api';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Input, message } from 'ant-design-vue';

import { updateFileObject } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const fileName = ref('');
const fileId = ref<number>();
const originalName = ref('');

const [Modal, modalApi] = useVbenModal({
  confirmText: $t('common.save'),
  async onConfirm() {
    const name = fileName.value.trim();
    if (!name) {
      message.warning($t('system.fileCenter.nameRequired'));
      return;
    }
    if (!fileId.value) return;
    modalApi.lock();
    try {
      await updateFileObject(fileId.value, name);
      message.success($t('common.updateSuccess'));
      emits('success');
      modalApi.close();
    } catch {
      modalApi.unlock();
    }
  },
  onOpenChange(open) {
    if (!open) return;
    const row = modalApi.getData<FileCenterApi.FileObject>();
    fileId.value = row?.id;
    originalName.value = row?.fileName ?? '';
    fileName.value = originalName.value;
  },
});
</script>

<template>
  <Modal :title="$t('system.fileCenter.editTitle')">
    <div class="edit-shell">
      <p class="text-muted-foreground text-sm">
        {{ $t('system.fileCenter.editNameHint') }}
      </p>
      <Input
        v-model:value="fileName"
        :maxlength="255"
        :placeholder="$t('system.fileCenter.editName')"
      />
    </div>
  </Modal>
</template>

<style scoped>
.edit-shell {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}
</style>
