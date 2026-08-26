<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createRelation, deleteRelation, getDictionaryList, getEntryList, getRelationList, updateRelation } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import RelationForm from './modules/form.vue';

defineOptions({ name: 'EvieRelationList' });

const currentEntryId = ref<number>();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: RelationForm,
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
          const entryId = values.entryId || 0;
          const resp = await getRelationList(entryId, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
            entryId: undefined,
            dictionaryId: undefined,
          });
          return { items: resp.relations, total: resp.total };
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
    updateRelation(values.id, values).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createRelation(currentEntryId.value || 0, values).then(() => {
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
        await deleteRelation(row.id);
        message.success($t('ui.actionMessage.operationSuccess'));
        refresh();
      },
    });
  }
}

async function handleCreate() {
  const values = await gridApi.formApi.getValues();
  const entryId = values.entryId;
  if (!entryId) {
    message.warning($t('evie.dictionary.selectEntry'));
    return;
  }
  currentEntryId.value = entryId;
  drawerApi.setData({ entryId }).open();
}

async function loadDictionaries() {
  const resp = await getDictionaryList({ pageSize: 200 });
  const options = resp.dictionaries.map((d: any) => ({
    label: d.name,
    value: d.id,
  }));
  gridApi.formApi.updateSchema([
    {
      fieldName: 'dictionaryId',
      componentProps: { options, showSearch: true, optionFilterProp: 'label' },
    },
  ]);
}

async function loadEntries() {
  const resp = await getEntryList(0, { pageSize: 1000 });
  const options = resp.entries.map((e: any) => ({
    label: `${e.standardText} (#${e.dictionaryId})`,
    value: e.id,
  }));
  gridApi.formApi.updateSchema([
    {
      fieldName: 'entryId',
      componentProps: { options, showSearch: true, optionFilterProp: 'label' },
    },
  ]);
}

onMounted(() => {
  loadDictionaries();
  loadEntries();
});
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.relations')">
      <template #toolbar-tools>
        <Button type="primary" @click="handleCreate">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
