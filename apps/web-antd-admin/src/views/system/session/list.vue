<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { Modal, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getSessionList, revokeSession } from '#/api';
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
          getSessionList({
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
  if (code !== 'revoke') return;
  Modal.confirm({
    content: $t('system.session.revokeConfirm', [row.username]),
    title: $t('system.session.revoke'),
    async onOk() {
      await revokeSession(row.id);
      message.success($t('system.session.revokeSuccess'));
      gridApi.query();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.session.list')" />
  </Page>
</template>

