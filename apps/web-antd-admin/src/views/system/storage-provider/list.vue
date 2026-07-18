<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { StorageProviderApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteStorageProvider,
  getStorageProviderList,
  setDefaultStorageProvider,
  testStorageProvider,
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
          getStorageProviderList({
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
  } as VxeTableGridOptions<StorageProviderApi.Provider>,
});

function onActionClick(e: OnActionClickParams<StorageProviderApi.Provider>) {
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

function onDelete(row: StorageProviderApi.Provider) {
  Modal.confirm({
    content: $t('system.storageProvider.deleteConfirm', [row.name]),
    title: $t('common.delete'),
    async onOk() {
      await deleteStorageProvider(row.id);
      message.success($t('common.success'));
      onRefresh();
    },
  });
}

function onSetDefault(row: StorageProviderApi.Provider) {
  if (row.isDefault) {
    message.info($t('system.storageProvider.alreadyDefault'));
    return;
  }
  Modal.confirm({
    content: $t('system.storageProvider.defaultConfirm', [row.name]),
    title: $t('system.storageProvider.setDefault'),
    async onOk() {
      await setDefaultStorageProvider(row.id);
      message.success($t('common.success'));
      onRefresh();
    },
  });
}

async function onTest(row: StorageProviderApi.Provider) {
  const result = await testStorageProvider({ id: row.id });
  if (result.healthy) {
    message.success($t('system.storageProvider.testSuccess'));
  } else {
    message.error(result.message || $t('system.storageProvider.testFailed'));
  }
  onRefresh();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.storageProvider.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
