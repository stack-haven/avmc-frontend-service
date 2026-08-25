<script setup lang="ts">
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, Tag, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createCategory, deleteCategory, getCategoryList, updateCategory } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import CategoryForm from './modules/form.vue';

defineOptions({ name: 'EvieCategoryList' });

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: CategoryForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) => {
          const resp = await getCategoryList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          });
          return { items: resp.categories, total: resp.total };
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
    updateCategory(values.id, values).then(() => {
      message.success($t('common.success'));
      drawerApi.close();
      refresh();
    });
  } else {
    createCategory(values).then(() => {
      message.success($t('common.success'));
      drawerApi.close();
      refresh();
    });
  }
}

function handleEdit(row: any) {
  drawerApi.setData(row).open();
}

function handleDelete(row: any) {
  Modal.confirm({
    title: $t('common.delete'),
    async onOk() {
      await deleteCategory(row.id);
      message.success($t('common.success'));
      refresh();
    },
  });
}
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.categories')">
      <template #toolbar-tools>
        <Button type="primary" @click="drawerApi.setData({}).open()">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
      <template #operation="{ row }">
        <template v-if="!row.builtin">
          <Button size="small" type="link" @click="handleEdit(row)">
            {{ $t('common.edit') }}
          </Button>
          <Button size="small" type="link" danger @click="handleDelete(row)">
            {{ $t('common.delete') }}
          </Button>
        </template>
        <Tag v-else color="blue">{{ $t('evie.category.builtin') }}</Tag>
      </template>
    </Grid>
  </Page>
</template>
