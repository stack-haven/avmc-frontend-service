<script setup lang="ts">
import { Page, useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteHotword, getHotwordList, upsertHotword } from '#/api';
import { $t } from '#/locales';

import { columns, formSchema, searchSchema } from './data';

const [Form, formApi] = useVbenForm({ schema: formSchema(), showDefaultActions: false });

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel: () => drawerApi.close(),
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as any;
    await upsertHotword(values);
    message.success($t('common.success'));
    drawerApi.close();
    refresh();
  },
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async (_page: any, values: Record<string, any>) => {
          const resp = await getHotwordList(values);
          return { items: resp.hotwords };
        },
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

function refresh() {
  gridApi.query();
}

function openEdit(row: any) {
  formApi.setValues(row);
  drawerApi.open();
}

function onAction({ code, row }: any) {
  if (code === 'edit') openEdit(row);
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.delete'),
      async onOk() {
        await deleteHotword(row.id);
        message.success($t('common.success'));
        refresh();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <Drawer>
      <Form />
    </Drawer>
    <Grid :table-title="$t('evie.hotword.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="formApi.resetForm(); drawerApi.open()">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
