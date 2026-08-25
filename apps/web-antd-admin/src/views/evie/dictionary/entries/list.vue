<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Empty, Modal, Select, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createEntry, deleteEntry, getDictionaryList, getEntryList, updateEntry } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import EntryForm from './modules/form.vue';

defineOptions({ name: 'EvieEntryList' });

const dictionaryId = ref<number>();
const dictionaryOptions = ref<{ label: string; value: number }[]>([]);

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
          if (!dictionaryId.value) {
            return { items: [], total: 0 };
          }
          const resp = await getEntryList(dictionaryId.value, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
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
  const payload = { ...values, dictionaryId: dictionaryId.value };
  if (values.id) {
    updateEntry(values.id, payload).then(() => {
      message.success($t('common.success'));
      drawerApi.close();
      refresh();
    });
  } else {
    createEntry(dictionaryId.value!, payload).then(() => {
      message.success($t('common.success'));
      drawerApi.close();
      refresh();
    });
  }
}

function onAction({ code, row }: any) {
  if (code === 'edit') {
    drawerApi.setData({ ...row, dictionaryId: dictionaryId.value }).open();
  }
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.delete'),
      async onOk() {
        await deleteEntry(row.id);
        message.success($t('common.success'));
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
  }
}

function onDictionaryChange(value: any) {
  dictionaryId.value = value;
  refresh();
}

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.entries')">
      <template #toolbar-tools>
        <Select
          v-model:value="dictionaryId"
          class="!w-56"
          :options="dictionaryOptions"
          :placeholder="$t('evie.dictionary.selectDictionary')"
          show-search
          option-filter-prop="label"
          @change="onDictionaryChange"
        />
        <Button
          type="primary"
          :disabled="!dictionaryId"
          @click="drawerApi.setData({ dictionaryId }).open()"
        >
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
    <Empty
      v-if="!dictionaryId"
      :description="$t('evie.dictionary.selectDictionary')"
    />
  </Page>
</template>
