<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { NotificationApi } from '#/api';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, Tabs, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteNotificationTemplate,
  getNotificationMessageList,
  getNotificationTemplateList,
} from '#/api';
import { $t } from '#/locales';

import {
  messageColumns,
  messageSearchSchema,
  templateColumns,
  templateSearchSchema,
} from './data';
import SendForm from './modules/send-form.vue';
import TemplateForm from './modules/template-form.vue';

const [TemplateDrawer, templateDrawerApi] = useVbenDrawer({
  connectedComponent: TemplateForm,
  destroyOnClose: true,
});

const [SendDrawer, sendDrawerApi] = useVbenDrawer({
  connectedComponent: SendForm,
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

function refreshTemplates() {
  templateGridApi.query();
}

function refreshMessages() {
  messageGridApi.query();
}

function refreshAll() {
  refreshTemplates();
  refreshMessages();
}

function onCreateTemplate() {
  templateDrawerApi.setData({}).open();
}

function onSend() {
  sendDrawerApi.setData({}).open();
}

function onTemplateAction(e: OnActionClickParams<NotificationApi.Template>) {
  if (e.code === 'edit') templateDrawerApi.setData(e.row).open();
  if (e.code === 'delete') {
    Modal.confirm({
      content: $t('system.notification.deleteTemplateConfirm', [e.row.name]),
      title: $t('common.delete'),
      async onOk() {
        await deleteNotificationTemplate(e.row.id);
        message.success($t('common.success'));
        refreshTemplates();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <TemplateDrawer @success="refreshTemplates" />
    <SendDrawer @success="refreshAll" />
    <Tabs>
      <Tabs.TabPane key="templates" :tab="$t('system.notification.templates')">
        <TemplateGrid :table-title="$t('system.notification.templateList')">
          <template #toolbar-tools>
            <Button type="primary" @click="onCreateTemplate">
              <Plus class="size-5" />
              {{ $t('common.create') }}
            </Button>
          </template>
        </TemplateGrid>
      </Tabs.TabPane>
      <Tabs.TabPane key="messages" :tab="$t('system.notification.messages')">
        <MessageGrid :table-title="$t('system.notification.messageList')">
          <template #toolbar-tools>
            <Button type="primary" @click="onSend">
              <Plus class="size-5" />
              {{ $t('system.notification.sendInApp') }}
            </Button>
          </template>
        </MessageGrid>
      </Tabs.TabPane>
    </Tabs>
  </Page>
</template>
