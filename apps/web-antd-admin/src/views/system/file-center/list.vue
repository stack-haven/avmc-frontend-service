<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileCenterApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileObject,
  getFileObjectList,
  presignFileDownload,
} from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import Detail from './modules/detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
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
          getFileObjectList({
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
  } as VxeTableGridOptions<FileCenterApi.FileObject>,
});

function onActionClick(e: OnActionClickParams<FileCenterApi.FileObject>) {
  if (e.code === 'detail') detailDrawerApi.setData(e.row).open();
  if (e.code === 'download') onDownload(e.row);
  if (e.code === 'delete') onDelete(e.row);
}

function onRefresh() {
  gridApi.query();
}

async function onDownload(row: FileCenterApi.FileObject) {
  const result = await presignFileDownload(row.id);
  if (!result.downloadUrl) {
    message.error($t('system.fileCenter.downloadUrlMissing'));
    return;
  }
  window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
}

function onDelete(row: FileCenterApi.FileObject) {
  Modal.confirm({
    content: $t('system.fileCenter.deleteConfirm', [row.fileName ?? row.id]),
    title: $t('common.delete'),
    async onOk() {
      await deleteFileObject(row.id, `web-file-delete-${row.id}`);
      message.success($t('common.success'));
      onRefresh();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('system.fileCenter.list')" />
  </Page>
</template>
