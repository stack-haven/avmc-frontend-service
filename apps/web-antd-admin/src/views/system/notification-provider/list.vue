<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { NotificationProviderApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteNotificationProvider,
  getNotificationProviderList,
  setDefaultNotificationProvider,
  testNotificationProvider,
} from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: searchSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: columns(onActionClick),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) =>
          getNotificationProviderList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...formValues,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<NotificationProviderApi.Provider>,
});

function onActionClick(e: OnActionClickParams<NotificationProviderApi.Provider>) {
  if (e.code === 'edit') formDrawerApi.setData(e.row).open();
  if (e.code === 'delete') onDelete(e.row);
  if (e.code === 'default') onSetDefault(e.row);
  if (e.code === 'test') onTest(e.row);
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onRefresh() {
  gridApi.query();
}

function onDelete(row: NotificationProviderApi.Provider) {
  Modal.confirm({
    content: $t('system.notificationProvider.deleteConfirm', [row.name]),
    title: $t('common.delete'),
    async onOk() {
      await deleteNotificationProvider(row.id);
      message.success($t('common.deleteSuccess'));
      onRefresh();
    },
  });
}

function onSetDefault(row: NotificationProviderApi.Provider) {
  if (row.isDefault) {
    message.info($t('system.notificationProvider.alreadyDefault'));
    return;
  }
  Modal.confirm({
    content: $t('system.notificationProvider.defaultConfirm', [row.name]),
    title: $t('system.notificationProvider.setDefault'),
    async onOk() {
      await setDefaultNotificationProvider(row.id);
      message.success($t('common.updateSuccess'));
      onRefresh();
    },
  });
}

async function onTest(row: NotificationProviderApi.Provider) {
  const result = await testNotificationProvider(row.id);
  if (result.healthy) {
    message.success($t('system.notificationProvider.testSuccess'));
  } else {
    message.error(result.message || $t('system.notificationProvider.testFailed'));
  }
  onRefresh();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.notificationProvider.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
