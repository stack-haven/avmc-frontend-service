<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Tag } from 'ant-design-vue';

const MusicIcon = createIconifyIcon('mdi:music-note');

const url = ref('');
const title = ref('');
const sessionId = ref('');
const objectUrl = ref('');

const [Modal, modalApi] = useVbenModal({
  footer: false,
  onOpenChange(open) {
    if (open) {
      const data = modalApi.getData<{ url: string; title: string; sessionId: string }>();
      url.value = data?.url || '';
      title.value = data?.title || '原始音频预览';
      sessionId.value = data?.sessionId || '';
    } else {
      // 关闭时释放 blob URL，避免内存泄漏
      if (objectUrl.value) {
        URL.revokeObjectURL(objectUrl.value);
        objectUrl.value = '';
      }
      url.value = '';
    }
  },
});

defineExpose({
  setObjectUrl(v: string) {
    objectUrl.value = v;
  },
});
</script>

<template>
  <Modal :title="title" centered class="w-[520px]">
    <div class="flex flex-col items-center gap-4 py-4">
      <div class="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <MusicIcon class="size-7 text-primary" />
      </div>

      <div v-if="sessionId" class="flex items-center gap-2 text-xs text-muted-foreground">
        会话：<Tag color="blue">{{ sessionId }}</Tag>
      </div>

      <audio v-if="url" :src="url" controls autoplay class="w-full" />

      <div v-else class="text-sm text-muted-foreground">暂无音频数据</div>
    </div>
  </Modal>
</template>
