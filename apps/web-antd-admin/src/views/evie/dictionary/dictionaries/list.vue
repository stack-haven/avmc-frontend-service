<script setup lang="ts">
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createDictionary, deleteDictionary, getDictionaryList, updateDictionary } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import DictionaryForm from './modules/form.vue';

defineOptions({ name: 'EvieDictionaryList' });

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DictionaryForm,
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
          const resp = await getDictionaryList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          });
          return { items: resp.dictionaries, total: resp.total };
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
    updateDictionary(values.id, values).then(() => {
      message.success($t('common.success'));
      drawerApi.close();
      refresh();
    });
  } else {
    createDictionary(values).then(() => {
      message.success($t('common.success'));
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
        await deleteDictionary(row.id);
        message.success($t('common.success'));
        refresh();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.dictionaries')">
      <template #toolbar-tools>
        <Button type="primary" @click="drawerApi.setData({}).open()">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
