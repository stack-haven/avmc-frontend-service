<script setup lang="ts">
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAsrRecordAudio, getAsrRecordList, reRecognize } from '#/api';
import { $t } from '#/locales';

import AudioPlayer from './modules/audio-player.vue';
import DetailDrawerComp from './modules/detail-drawer.vue';
import VoiceRecognition from './modules/voice-recognition.vue';

const MicrophoneIcon = createIconifyIcon('mdi:microphone');
const PlayIcon = createIconifyIcon('mdi:play-circle-outline');

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

async function reRecognizeRecord(id: number) {
  const hide = message.loading('重新识别中（约 10-15s）...', 0);
  try {
    await reRecognize(id);
    hide();
    message.success('重新识别完成');
    gridApi.query();
  } catch (e: any) {
    hide();
    message.error(e?.message || '重新识别失败');
  }
}

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
      // 识别文本：单行省略 + 悬停显示全文
      {
        field: 'rawText',
        minWidth: 260,
        showOverflow: 'tooltip',
        title: $t('evie.asr.rawText'),
      },
      { field: 'confidence', width: 90, title: $t('evie.asr.confidence') },
      { field: 'engine', width: 100, title: $t('evie.asr.engine') },
      { field: 'createdAt', width: 170, title: $t('evie.asr.createdAt') },
      { align: 'center', field: 'action', slots: { default: 'action' }, title: '操作', width: 100 },
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
  </Page>
</template>
