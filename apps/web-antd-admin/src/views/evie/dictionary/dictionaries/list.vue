<script setup lang="ts">
import { useRouter } from 'vue-router';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message as toast } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createDictionary, deleteDictionary, getDictionaryList, updateDictionary } from '#/api/evie';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import DictionaryForm from './modules/form.vue';

defineOptions({ name: 'EvieDictionaryList' });

const router = useRouter();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: DictionaryForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction, onEnter),
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
    rowConfig: { isHover: true, keyField: 'id', rowClass: 'cursor-pointer' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

function refresh() {
  gridApi.query();
}

function onSubmit(values: any) {
  if (values.id) {
    updateDictionary(values.id, values).then(() => {
      toast.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createDictionary(values).then(() => {
      toast.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  }
}

/**
 * 行点击 / 「进入」操作：跳转到词条列表（带 dictionaryId URL 上下文）。
 * 替代「详情页」设计——通过 4 个子页面（entries/relations/versions/conflicts）
 * 的 URL ?dictionaryId=N 预选机制实现「上下文导航」。
 */
function onEnter(row: any) {
  if (!row?.id) return;
  router.push({ path: '/evie/dictionary/entries', query: { dictionaryId: String(row.id) } });
}

function onAction({ code, row }: any) {
  if (code === 'enter') {
    onEnter(row);
  }
  if (code === 'edit') {
    drawerApi.setData(row).open();
  }
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.deleteConfirm'),
      async onOk() {
        await deleteDictionary(row.id);
        toast.success($t('ui.actionMessage.operationSuccess'));
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