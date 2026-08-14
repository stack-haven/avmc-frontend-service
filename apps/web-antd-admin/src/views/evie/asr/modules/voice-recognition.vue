<script setup lang="ts">
import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button, Divider, Spin, Tag, message } from 'ant-design-vue';

import { recognizeAndCorrect } from '#/api';

const MicrophoneIcon = createIconifyIcon('mdi:microphone');
const LoadingIcon = createIconifyIcon('mdi:loading');

const emits = defineEmits(['success']);

const recording = ref(false);
const loading = ref(false);
const seconds = ref(0);
const originalText = ref('');
const correctedText = ref('');
const changes = ref<{ from: string; to: string }[]>([]);
const providerName = ref('');

let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let timer: any = null;

const [Modal] = useVbenModal({
  footer: false,
  onOpenChange(open) {
    if (!open) reset();
  },
});

function reset() {
  recording.value = false;
  loading.value = false;
  seconds.value = 0;
  originalText.value = '';
  correctedText.value = '';
  changes.value = [];
  providerName.value = '';
  if (timer) clearInterval(timer);
}

async function startRecord() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // 提高音频质量：opus 128kbps，利于 ASR 识别精度
    mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond: 128_000 });
    chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = handleStop;
    mediaRecorder.start();
    recording.value = true;
    seconds.value = 0;
    timer = setInterval(() => seconds.value++, 1000);
  } catch (e) {
    message.error('无法访问麦克风，请检查浏览器权限');
    console.error(e);
  }
}

function stopRecord() {
  if (mediaRecorder && recording.value) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    clearInterval(timer);
    recording.value = false;
  }
}

async function handleStop() {
  const blob = new Blob(chunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
  const base64 = await blobToBase64(blob);
  loading.value = true;
  try {
    const resp = await recognizeAndCorrect({
      sessionId: `web-${Date.now()}`,
      audioData: base64,
    });
    originalText.value = resp.originalText;
    correctedText.value = resp.correctedText;
    changes.value = resp.changes.map((c) => ({ from: c.from, to: c.to }));
    providerName.value = resp.providerName;
    emits('success');
  } catch (e: any) {
    message.error(e?.message || '识别失败');
  } finally {
    loading.value = false;
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
</script>

<template>
  <Modal :title="$t('evie.asr.title')">
    <div class="flex flex-col items-center gap-5 py-6">
      <!-- 录音按钮 -->
      <div class="flex flex-col items-center gap-3">
        <Button
          shape="circle"
          size="large"
          :type="recording ? 'default' : 'primary'"
          :danger="recording"
          class="!h-20 !w-20 !text-3xl"
          @click="recording ? stopRecord() : startRecord()"
        >
          <MicrophoneIcon v-if="!recording" />
          <LoadingIcon v-else class="animate-spin" />
        </Button>
        <div class="text-sm" :class="recording ? 'text-red-500' : 'text-muted-foreground'">
          {{ recording ? `正在录音 ${seconds}s，点击停止` : '点击开始录音' }}
        </div>
      </div>

      <!-- 识别中 -->
      <div v-if="loading" class="flex items-center gap-2 text-muted-foreground">
        <Spin size="small" />
        识别中（约 10-15s）...
      </div>

      <!-- 识别结果 -->
      <div v-if="!loading && (originalText || correctedText)" class="w-full space-y-3">
        <Divider />
        <div class="text-xs text-muted-foreground">
          引擎：<Tag color="blue">{{ providerName }}</Tag>
        </div>
        <div>
          <div class="mb-1 text-sm font-medium text-muted-foreground">原始识别</div>
          <div class="rounded-lg bg-muted p-3 text-sm leading-relaxed">{{ originalText }}</div>
        </div>
        <div>
          <div class="mb-1 text-sm font-medium text-primary">纠错后（标准企业语言）</div>
          <div class="rounded-lg bg-primary/5 p-3 text-sm font-medium leading-relaxed">
            {{ correctedText }}
          </div>
        </div>
        <div v-if="changes.length" class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-muted-foreground">纠错：</span>
          <Tag v-for="c in changes" :key="c.from + c.to" color="green">
            {{ c.from }} → {{ c.to }}
          </Tag>
        </div>
      </div>
    </div>
  </Modal>
</template>
