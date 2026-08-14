<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getAsrRecordList } from '#/api';
import { $t } from '#/locales';

import VoiceRecognition from './modules/voice-recognition.vue';

const MicrophoneIcon = createIconifyIcon('mdi:microphone');

const [VoiceModal, voiceModalApi] = useVbenModal({
  connectedComponent: VoiceRecognition,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'id', width: 80, title: 'ID' },
      { field: 'sessionId', width: 150, title: $t('evie.asr.sessionId') },
      { field: 'rawText', minWidth: 280, title: $t('evie.asr.rawText') },
      { field: 'confidence', width: 100, title: $t('evie.asr.confidence') },
      { field: 'engine', width: 100, title: $t('evie.asr.engine') },
      { field: 'createdAt', width: 180, title: $t('evie.asr.createdAt') },
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
    <Grid :table-title="$t('evie.asr.records')">
      <template #toolbar-tools>
        <Button type="primary" @click="voiceModalApi.open()">
          <MicrophoneIcon class="mr-1 size-4" />
          {{ $t('evie.asr.title') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
