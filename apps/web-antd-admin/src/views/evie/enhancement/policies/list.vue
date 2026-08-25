<script setup lang="ts">
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createPolicy, deletePolicy, getPolicyList, updatePolicy } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import PolicyForm from './modules/form.vue';

defineOptions({ name: 'EviePolicyList' });

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: PolicyForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) => {
          const resp = await getPolicyList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          });
          return { items: resp.policies, total: resp.total };
        },
      },
      response: { list: 'items', total: 'total' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

function refresh() {
  gridApi.query();
}

function onSubmit(values: any) {
  if (values.id) {
    updatePolicy(values.id, values).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createPolicy(values).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  }
}

function onAction({ code, row }: any) {
  if (code === 'edit') {
    drawerApi.setData(row).open();
  }
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.delete'),
      async onOk() {
        await deletePolicy(row.id);
        message.success($t('ui.actionMessage.operationSuccess'));
        refresh();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.enhancement.policies')">
      <template #toolbar-tools>
        <Button type="primary" @click="drawerApi.setData({}).open()">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
