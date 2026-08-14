<script setup lang="ts">
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FileCenterApi } from '#/api';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteFileObject,
  downloadFileContent,
  getFileObjectList,
  presignFileDownload,
} from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import AccessLog from './modules/access-log.vue';
import Detail from './modules/detail.vue';
import Edit from './modules/edit.vue';
import Preview from './modules/preview.vue';
import Replace from './modules/replace.vue';
import Upload from './modules/upload.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const [UploadModal, uploadModalApi] = useVbenModal({
  connectedComponent: Upload,
  destroyOnClose: true,
});

const [EditModal, editModalApi] = useVbenModal({
  connectedComponent: Edit,
  destroyOnClose: true,
});

const [ReplaceModal, replaceModalApi] = useVbenModal({
  connectedComponent: Replace,
  destroyOnClose: true,
});

const [PreviewModal, previewModalApi] = useVbenModal({
  connectedComponent: Preview,
  destroyOnClose: true,
});

const [AccessLogModal, accessLogModalApi] = useVbenModal({
  connectedComponent: AccessLog,
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
  if (e.code === 'preview') previewModalApi.setData(e.row).open();
  if (e.code === 'download') onDownload(e.row);
  if (e.code === 'accessLog') accessLogModalApi.setData(e.row).open();
  if (e.code === 'edit') editModalApi.setData(e.row).open();
  if (e.code === 'replace') replaceModalApi.setData(e.row).open();
  if (e.code === 'detail') detailDrawerApi.setData(e.row).open();
  if (e.code === 'delete') onDelete(e.row);
}

function onRefresh() {
  gridApi.query();
}

async function onDownload(row: FileCenterApi.FileObject) {
  if (row.provider === 'local') {
    // 本地渠道：后端代理读取内容，转 blob 后触发下载
    const result = await downloadFileContent(row.id);
    const binary = atob(result.content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: result.contentType || 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName || row.fileName || `file-${row.id}`;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }
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

function onUpload() {
  uploadModalApi.open();
}
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />
    <UploadModal @success="onRefresh" />
    <EditModal @success="onRefresh" />
    <ReplaceModal @success="onRefresh" />
    <PreviewModal />
    <AccessLogModal />
    <Grid :table-title="$t('system.fileCenter.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onUpload">
          <Plus class="size-5" />
          {{ $t('system.fileCenter.upload') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
