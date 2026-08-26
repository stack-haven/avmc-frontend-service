<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createEntry, deleteEntry, getDictionaryList, getEntryList, updateEntry } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import EntryForm from './modules/form.vue';

defineOptions({ name: 'EvieEntryList' });

const currentDictionaryId = ref<number>();

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: EntryForm,
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
          const dictionaryId = values.dictionaryId || 0;
          const resp = await getEntryList(dictionaryId, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
            dictionaryId: undefined,
          });
          return { items: resp.entries, total: resp.total };
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
  const payload = { ...values };
  if (values.id) {
    updateEntry(values.id, payload).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createEntry(currentDictionaryId.value || 0, payload).then(() => {
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
        await deleteEntry(row.id);
        message.success($t('ui.actionMessage.operationSuccess'));
        refresh();
      },
    });
  }
}

async function handleCreate() {
  const values = await gridApi.formApi.getValues();
  const dictionaryId = values.dictionaryId;
  if (!dictionaryId) {
    message.warning($t('evie.dictionary.selectDictionary'));
    return;
  }
  currentDictionaryId.value = dictionaryId;
  drawerApi.setData({ dictionaryId }).open();
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

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.entries')">
      <template #toolbar-tools>
        <Button type="primary" @click="handleCreate">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
