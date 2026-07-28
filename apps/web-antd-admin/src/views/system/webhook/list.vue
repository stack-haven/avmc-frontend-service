<script setup lang="ts">
import type { WebhookApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Modal, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteWebhookSubscription,
  getWebhookDeliveryLogList,
  getWebhookSubscriptionList,
  retryWebhookDelivery,
} from '#/api';
import { $t } from '#/locales';
import { columns, deliveryLogColumns, searchSchema } from './data';
import WebhookForm from './modules/form.vue';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) =>
          getWebhookSubscriptionList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    toolbarOptions: { buttons: [
      { code: 'add', text: $t('system.webhook.addSubscription'), onClick: handleAdd },
    ] },
  } as any,
});

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: WebhookForm,
  destroyOnClose: true,
});

const [LogDrawer, logDrawerApi] = useVbenDrawer({
  title: $t('system.webhook.deliveryLogs'),
});

function handleAdd() {
  formDrawerApi.setData(null);
  formDrawerApi.open();
}

function onAction({ code, row }: { code: string; row: WebhookApi.Subscription }) {
  switch (code) {
    case 'edit':
      formDrawerApi.setData(row);
      formDrawerApi.open();
      break;
    case 'logs':
      logDrawerApi.setData(row);
      logDrawerApi.open();
      break;
    case 'delete':
      Modal.confirm({
        content: $t('system.webhook.deleteConfirm', [row.name]),
        title: $t('common.delete'),
        async onOk() {
          await deleteWebhookSubscription(row.id);
          message.success($t('common.deleteSuccess'));
          gridApi.query();
        },
      });
      break;
  }
}

// Delivery Logs Grid (inside the log drawer)
const [LogGrid, logGridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: deliveryLogColumns,
    height: 500,
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          const sub = logDrawerApi.getData<WebhookApi.Subscription>();
          return getWebhookDeliveryLogList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            subscriptionId: sub?.id,
          });
        },
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, export: false, refresh: true, zoom: true },
    toolbarOptions: { buttons: [
      {
        code: 'retry',
        text: $t('system.webhook.retrySelected'),
        onClick: async () => {
          const rows = logGridApi.grid.getCheckboxRecords();
          if (!rows.length) return message.warning($t('system.webhook.selectRetry'));
          for (const r of rows) {
            if ((r as WebhookApi.DeliveryLog).deliveryStatus === 'WEBHOOK_DELIVERY_STATUS_FAILED') {
              await retryWebhookDelivery((r as WebhookApi.DeliveryLog).id);
            }
          }
          message.success($t('system.webhook.retryEnqueued'));
          logGridApi.query();
        },
      },
    ] },
    checkboxConfig: { checkField: 'id' },
  } as any,
});
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.webhook.title')" />
    <FormDrawer @closed="gridApi.query()" />
    <LogDrawer @open="logGridApi.query()" fullscreen>
      <LogGrid />
    </LogDrawer>
  </Page>
</template>
