<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { NotificationApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteNotificationTemplate,
  getNotificationTemplateList,
} from '#/api';
import { $t } from '#/locales';

import { templateColumns, templateSearchSchema } from './data';
import TemplateForm from './modules/template-form.vue';

const [TemplateDrawer, templateDrawerApi] = useVbenDrawer({
  connectedComponent: TemplateForm,
  destroyOnClose: true,
});

const [TemplateGrid, templateGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: templateSearchSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: templateColumns(onTemplateAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }, values) =>
          getNotificationTemplateList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as VxeTableGridOptions<NotificationApi.Template>,
});

function refreshTemplates() {
  templateGridApi.query();
}

function onCreateTemplate() {
  templateDrawerApi.setData({}).open();
}

function onTemplateAction(e: OnActionClickParams<NotificationApi.Template>) {
  if (e.code === 'edit') templateDrawerApi.setData(e.row).open();
  if (e.code === 'delete') {
    Modal.confirm({
      content: $t('system.notification.deleteTemplateConfirm', [e.row.name]),
      title: $t('common.delete'),
      async onOk() {
        await deleteNotificationTemplate(e.row.id);
        message.success($t('common.deleteSuccess'));
        refreshTemplates();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <TemplateDrawer @success="refreshTemplates" />
    <TemplateGrid :table-title="$t('system.notification.templateList')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreateTemplate">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </TemplateGrid>
  </Page>
</template>
