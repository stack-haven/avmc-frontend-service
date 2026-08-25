<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, Select, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createRelation, deleteRelation, getDictionaryList, getEntryList, getRelationList, updateRelation } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import RelationForm from './modules/form.vue';

defineOptions({ name: 'EvieRelationList' });

const dictionaryId = ref<number>();
const entryId = ref<number>();
const dictionaryOptions = ref<{ label: string; value: number }[]>([]);
const entryOptions = ref<{ label: string; value: number }[]>([]);

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
          if (!entryId.value) {
            return { items: [], total: 0 };
          }
          const resp = await getRelationList(entryId.value, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
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
  const payload = { ...values, entryId: entryId.value };
  if (values.id) {
    updateRelation(values.id, payload).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createRelation(entryId.value!, payload).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  }
}

function onAction({ code, row }: any) {
  if (code === 'edit') {
    drawerApi.setData({ ...row, entryId: entryId.value }).open();
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

async function loadDictionaries() {
  const resp = await getDictionaryList({ pageSize: 200 });
  dictionaryOptions.value = resp.dictionaries.map((d: any) => ({
    label: d.name,
    value: d.id,
  }));
  if (!dictionaryId.value && dictionaryOptions.value.length) {
    dictionaryId.value = dictionaryOptions.value[0]?.value;
    await loadEntries();
  }
}

async function loadEntries() {
  if (!dictionaryId.value) return;
  entryId.value = undefined;
  const resp = await getEntryList(dictionaryId.value, { pageSize: 200 });
  entryOptions.value = resp.entries.map((e: any) => ({
    label: `${e.standardText} (${e.category ?? '-'})`,
    value: e.id,
  }));
  if (entryOptions.value.length) {
    entryId.value = entryOptions.value[0]?.value;
  }
  refresh();
}

function onDictionaryChange() {
  loadEntries();
}

function onEntryChange() {
  refresh();
}

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.relations')">
      <template #toolbar-tools>
        <Select
          v-model:value="dictionaryId"
          class="!w-48"
          :options="dictionaryOptions"
          :placeholder="$t('evie.dictionary.selectDictionary')"
          show-search
          option-filter-prop="label"
          @change="onDictionaryChange"
        />
        <Select
          v-model:value="entryId"
          class="!w-56"
          :options="entryOptions"
          :placeholder="$t('evie.dictionary.selectEntry')"
          show-search
          option-filter-prop="label"
          @change="onEntryChange"
        />
        <Button
          type="primary"
          :disabled="!entryId"
          @click="drawerApi.setData({ entryId }).open()"
        >
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
