<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';
import { useAccessStore } from '@vben/stores';

import { Button, Divider, Segmented, Select, Spin, Tag, message } from 'ant-design-vue';

import { correctText, getProfileList, recognizeAndCorrect } from '#/api';
import { $t } from '#/locales';

const MicrophoneIcon = createIconifyIcon('mdi:microphone');
const StopIcon = createIconifyIcon('mdi:stop');

const emits = defineEmits(['success']);

type RecMode = 'stream' | 'batch';

const mode = ref<RecMode>('stream');
const recording = ref(false);
const loading = ref(false);
const seconds = ref(0);
const originalText = ref('');
const correctedText = ref('');
const changes = ref<{ from: string; to: string }[]>([]);
const providerName = ref('');
const profileId = ref<number>();
const profileOptions = ref<{ label: string; value: number }[]>([]);

let ws: WebSocket | null = null;
let audioContext: AudioContext | null = null;
let processor: ScriptProcessorNode | null = null;
let sourceNode: MediaStreamAudioSourceNode | null = null;
let stream: MediaStream | null = null;
let timer: any = null;
let pcmChunks: Int16Array[] = [];

const [Modal] = useVbenModal({
  footer: false,
  onOpenChange(open) {
    if (!open) reset();
  },
});

function reset() {
  stopRecord();
  recording.value = false;
  loading.value = false;
  seconds.value = 0;
  originalText.value = '';
  correctedText.value = '';
  changes.value = [];
  providerName.value = '';
  pcmChunks = [];
  if (timer) clearInterval(timer);
}

async function startRecord() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (mode.value === 'stream') {
      const accessStore = useAccessStore();
      const token = accessStore.accessToken;
      const sessionId = `stream-${Date.now()}`;
      // 连接后端流式 WebSocket
      ws = new WebSocket(
        `ws://${location.hostname}:8100/evie/v1/asr/stream?token=${token}&session_id=${sessionId}`,
      );
      ws.onmessage = handleMessage;
      ws.onerror = () => message.error('流式连接异常');
    }

    recording.value = true;
    seconds.value = 0;
    timer = setInterval(() => seconds.value++, 1000);

    // 采集 PCM（16kHz 单声道）
    audioContext = new AudioContext({ sampleRate: 16000 });
    sourceNode = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm = floatToInt16(input);
      if (mode.value === 'stream') {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ audio: int16ToBase64(pcm), is_final: false }));
        }
      } else {
        pcmChunks.push(pcm);
      }
    };
    sourceNode.connect(processor);
    processor.connect(audioContext.destination);
  } catch (e) {
    message.error('无法访问麦克风，请检查浏览器权限');
    console.error(e);
  }
}

function stopRecord() {
  if (recording.value) {
    if (mode.value === 'stream' && ws) {
      // 发送结束信号
      ws.send(JSON.stringify({ audio: '', is_final: true }));
    } else if (mode.value === 'batch') {
      finalizeBatch();
    }
  }
  processor?.disconnect();
  sourceNode?.disconnect();
  audioContext?.close();
  stream?.getTracks().forEach((t) => t.stop());
  processor = null;
  sourceNode = null;
  audioContext = null;
  stream = null;
  if (timer) clearInterval(timer);
  recording.value = false;
}

function handleMessage(e: MessageEvent) {
  try {
    const data = JSON.parse(e.data);
    if (data.text) {
      originalText.value = data.text; // 实时显示增量文本
    }
    if (data.is_final) {
      ws?.close();
      ws = null;
      finalize();
    }
  } catch {
    // ignore
  }
}

async function finalize() {
  const text = originalText.value;
  if (!text) {
    message.warning($t('evie.asr.noVoice'));
    return;
  }
  loading.value = true;
  try {
    const resp = await correctText(text, `stream-${Date.now()}`, profileId.value);
    correctedText.value = resp.correctedText;
    changes.value = resp.changes.map((c) => ({ from: c.from, to: c.to }));
    providerName.value = resp.providerName || 'xunfei';
    emits('success');
  } catch {
    correctedText.value = text;
  } finally {
    loading.value = false;
  }
}

async function finalizeBatch() {
  if (!pcmChunks.length) {
    message.warning($t('evie.asr.noVoice'));
    return;
  }
  loading.value = true;
  try {
    const total = pcmChunks.reduce((s, c) => s + c.length, 0);
    const merged = new Int16Array(total);
    let offset = 0;
    for (const c of pcmChunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    pcmChunks = [];
    const base64 = int16ToBase64(merged);
    const resp = await recognizeAndCorrect({
      sessionId: `batch-${Date.now()}`,
      audioData: base64,
      encoding: 1, // PCM
      sampleRate: 16000,
      profileId: profileId.value,
    });
    originalText.value = resp.originalText;
    correctedText.value = resp.correctedText;
    changes.value = resp.changes.map((c) => ({ from: c.from, to: c.to }));
    providerName.value = resp.providerName || 'xunfei';
    emits('success');
  } catch (e: any) {
    message.error(e?.message || '识别失败');
  } finally {
    loading.value = false;
  }
}

function floatToInt16(input: Float32Array): Int16Array {
  const pcm = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i]!));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm;
}

function int16ToBase64(pcm: Int16Array): string {
  const bytes = new Uint8Array(pcm.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
async function loadProfiles() {
  try {
    const resp = await getProfileList({ pageSize: 100 });
    profileOptions.value = resp.profiles.map((p: any) => ({
      label: p.name,
      value: p.id,
    }));
  } catch {
    profileOptions.value = [];
  }
}

onMounted(loadProfiles);
</script>

<template>
  <Modal :title="$t('evie.asr.title')">
    <div class="flex flex-col items-center gap-5 py-6">
      <!-- 模式切换 -->
      <Segmented
        v-model:value="mode"
        :options="[
          { label: $t('evie.asr.modeStream'), value: 'stream' },
          { label: $t('evie.asr.modeBatch'), value: 'batch' },
        ]"
      />

      <!-- 增强场景选择 -->
      <div class="w-full max-w-xs">
        <Select
          v-model:value="profileId"
          class="w-full"
          :options="profileOptions"
          :placeholder="$t('evie.enhancement.profiles')"
          allow-clear
          show-search
          option-filter-prop="label"
        />
      </div>

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
          <StopIcon v-else />
        </Button>
        <div
          class="text-sm"
          :class="recording ? 'text-red-500' : 'text-muted-foreground'"
        >
          {{
            recording
              ? $t('evie.asr.recording', { seconds })
              : $t('evie.asr.startRecording')
          }}
        </div>
        <div class="text-xs text-muted-foreground">
          {{
            mode === 'stream'
              ? $t('evie.asr.streamHint')
              : $t('evie.asr.batchHint')
          }}
        </div>
      </div>

      <!-- 识别/纠错中 -->
      <div v-if="loading" class="flex items-center gap-2 text-muted-foreground">
        <Spin size="small" />
        {{ $t('evie.asr.correcting') }}
      </div>

      <!-- 识别结果 -->
      <div v-if="originalText || correctedText" class="w-full space-y-3">
        <Divider />
        <div v-if="providerName" class="text-xs text-muted-foreground">
          引擎：<Tag color="blue">{{ providerName }}</Tag>
        </div>
        <div>
          <div class="mb-1 text-sm font-medium text-muted-foreground">
            {{ $t('evie.asr.originalText') }}
          </div>
          <div class="rounded-lg bg-muted p-3 text-sm leading-relaxed">
            {{ originalText }}
          </div>
        </div>
        <div v-if="correctedText">
          <div class="mb-1 text-sm font-medium text-primary">
            {{ $t('evie.asr.correctedText') }}
          </div>
          <div
            class="rounded-lg bg-primary/5 p-3 text-sm font-medium leading-relaxed"
          >
            {{ correctedText }}
          </div>
        </div>
        <div v-if="changes.length" class="flex flex-wrap items-center gap-1">
          <span class="text-xs text-muted-foreground">
            {{ $t('evie.asr.corrections') }}：
          </span>
          <Tag v-for="c in changes" :key="c.from + c.to" color="green">
            {{ c.from }} → {{ c.to }}
          </Tag>
        </div>
      </div>
    </div>
  </Modal>
</template>
