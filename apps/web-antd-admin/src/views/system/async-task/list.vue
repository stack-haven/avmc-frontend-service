<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelAsyncTask,
  getAsyncTaskList,
  retryAsyncTask,
} from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) =>
          getAsyncTaskList({
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
  } as any,
});

function onAction({ code, row }: any) {
  if (code === 'cancel') {
    Modal.confirm({
      content: $t('system.asyncTask.cancelConfirm', [row.id]),
      title: $t('system.asyncTask.cancel'),
      async onOk() {
        await cancelAsyncTask(row.id);
        message.success($t('system.asyncTask.cancelSuccess'));
        gridApi.query();
      },
    });
  }
  if (code === 'retry') {
    Modal.confirm({
      content: $t('system.asyncTask.retryConfirm', [row.id]),
      title: $t('system.asyncTask.retry'),
      async onOk() {
        await retryAsyncTask(row.id);
        message.success($t('system.asyncTask.retrySuccess'));
        gridApi.query();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.asyncTask.list')" />
  </Page>
</template>
