<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { NotificationApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getNotificationMessageList } from '#/api';
import { $t } from '#/locales';

import { messageColumns, messageSearchSchema } from './data';
import SendForm from './modules/send-form.vue';

const [SendDrawer, sendDrawerApi] = useVbenDrawer({
  connectedComponent: SendForm,
  destroyOnClose: true,
});

const [MessageGrid, messageGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: messageSearchSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: messageColumns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, values) =>
          getNotificationMessageList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as VxeTableGridOptions<NotificationApi.Message>,
});

function refreshMessages() {
  messageGridApi.query();
}

function onSend() {
  sendDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <SendDrawer @success="refreshMessages" />
    <MessageGrid :table-title="$t('system.notification.messageList')">
      <template #toolbar-tools>
        <Button type="primary" @click="onSend">
          <Plus class="size-5" />
          {{ $t('system.notification.sendInApp') }}
        </Button>
      </template>
    </MessageGrid>
  </Page>
</template>
