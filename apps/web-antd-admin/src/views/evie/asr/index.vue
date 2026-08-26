<script setup lang="ts">
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { onMounted, ref } from 'vue';

import { createIconifyIcon } from '@vben/icons';

import { Button, Modal, Select, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAsrRecordAudio, getAsrRecordList, getProfileList, reRecognize } from '#/api';
import { $t } from '#/locales';

import AudioPlayer from './modules/audio-player.vue';
import DetailDrawerComp from './modules/detail-drawer.vue';
import VoiceRecognition from './modules/voice-recognition.vue';

const MicrophoneIcon = createIconifyIcon('mdi:microphone');
const PlayIcon = createIconifyIcon('mdi:play-circle-outline');

// 重新识别：增强场景选择
const reRecognizeOpen = ref(false);
const reRecognizeId = ref<number>();
const reRecognizeProfileId = ref<number>();
const reRecognizeOptions = ref<{ label: string; value: number }[]>([]);

const [VoiceModal, voiceModalApi] = useVbenModal({
  connectedComponent: VoiceRecognition,
  destroyOnClose: true,
});

const [AudioModal, audioModalApi] = useVbenModal({
  connectedComponent: AudioPlayer,
  destroyOnClose: true,
});

const [DetailDrawerWrapper, DetailDrawerApi] = useVbenDrawer({
  connectedComponent: DetailDrawerComp,
  destroyOnClose: true,
});

async function playAudio(id: number) {
  try {
    const resp = await getAsrRecordAudio(id);
    if (!resp.audioData) {
      message.warning('该记录无原始音频');
      return;
    }
    const bytes = atob(resp.audioData);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: resp.contentType || 'audio/webm' });
    const url = URL.createObjectURL(blob);
    audioModalApi.setData({ url, title: '原始音频预览', sessionId: `#${id}` }).open();
  } catch (e: any) {
    message.error(e?.message || '音频播放失败');
  }
}

function reRecognizeRecord(id: number) {
  reRecognizeId.value = id;
  reRecognizeProfileId.value = undefined;
  reRecognizeOpen.value = true;
}

async function confirmReRecognize() {
  if (!reRecognizeId.value) return;
  const hide = message.loading('重新识别中（约 10-15s）...', 0);
  try {
    await reRecognize(reRecognizeId.value, reRecognizeProfileId.value);
    hide();
    message.success('重新识别完成');
    reRecognizeOpen.value = false;
    gridApi.query();
  } catch (e: any) {
    hide();
    message.error(e?.message || '重新识别失败');
  }
}

async function loadProfiles() {
  try {
    const resp = await getProfileList({ pageSize: 100 });
    reRecognizeOptions.value = resp.profiles.map((p: any) => ({
      label: p.name,
      value: p.id,
    }));
  } catch {
    reRecognizeOptions.value = [];
  }
}

onMounted(loadProfiles);

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'id', width: 70, title: 'ID' },
      // 音频预览图标
      {
        align: 'center',
        field: 'audio',
        slots: { default: 'audio' },
        title: '音频',
        width: 70,
      },
      { field: 'sessionId', width: 150, title: $t('evie.asr.sessionId') },
      // 识别文本：固定限宽单行省略 + 悬停显示全文（避免挤压操作列）
      {
        field: 'rawText',
        minWidth: 220,
        maxWidth: 340,
        showOverflow: 'tooltip',
        title: $t('evie.asr.rawText'),
      },
      { field: 'confidence', width: 90, title: $t('evie.asr.confidence') },
      { field: 'engine', width: 100, title: $t('evie.asr.engine') },
      { field: 'createdAt', width: 170, title: $t('evie.asr.createdAt') },
      { align: 'center', field: 'action', slots: { default: 'action' }, title: '操作', width: 170, fixed: 'right' },
    ],
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          const resp = await getAsrRecordList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
          });
          return { items: resp.records, total: resp.total };
        },
      },
      response: { list: 'items', total: 'total' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { refresh: true, zoom: true },
  } as any,
});

function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <VoiceModal @success="onRefresh" />
    <AudioModal />
    <DetailDrawerWrapper />
    <Grid :table-title="$t('evie.asr.records')">
      <template #toolbar-tools>
        <Button type="primary" @click="voiceModalApi.open()">
          <MicrophoneIcon class="mr-1 size-4" />
          {{ $t('evie.asr.title') }}
        </Button>
      </template>
      <template #audio="{ row }">
        <Button type="link" size="small" @click="playAudio(row.id)">
          <PlayIcon class="size-5" />
        </Button>
      </template>
      <template #action="{ row }">
        <Button type="link" size="small" @click="DetailDrawerApi.setData(row).open()">
          详情
        </Button>
        <Button type="link" size="small" @click="reRecognizeRecord(row.id)">
          重新识别
        </Button>
      </template>
    </Grid>

    <!-- 重新识别：选择增强场景 -->
    <Modal
      v-model:open="reRecognizeOpen"
      :title="$t('evie.asr.reRecognize')"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @ok="confirmReRecognize"
    >
      <div class="py-3">
        <div class="mb-1 text-sm font-medium">
          {{ $t('evie.enhancement.profiles') }}
        </div>
        <Select
          v-model:value="reRecognizeProfileId"
          class="w-full"
          :options="reRecognizeOptions"
          :placeholder="$t('evie.asr.reRecognizeProfilePlaceholder')"
          allow-clear
          show-search
          option-filter-prop="label"
        />
      </div>
    </Modal>
  </Page>
</template>
