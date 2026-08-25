<script setup lang="ts">
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Button, Modal, Select, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictionaryList, getVersionList, publishDictionary } from '#/api';
import { $t } from '#/locales';

import { columns } from './data';

defineOptions({ name: 'EvieVersionList' });

const dictionaryId = ref<number>();
const dictionaryOptions = ref<{ label: string; value: number }[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: columns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          if (!dictionaryId.value) {
            return { items: [], total: 0 };
          }
          const resp = await getVersionList(dictionaryId.value, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
          });
          return { items: resp.versions, total: resp.total };
        },
      },
      response: { list: 'items', total: 'total' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as any,
});

function refresh() {
  gridApi.query();
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

function onDictionaryChange() {
  refresh();
}

function handlePublish() {
  Modal.confirm({
    title: $t('evie.dictionary.publishVersion'),
    content: $t('evie.dictionary.publishVersionHint'),
    async onOk() {
      await publishDictionary(dictionaryId.value!);
      message.success($t('ui.actionMessage.operationSuccess'));
      refresh();
    },
  });
}

function handleDetail(row: any) {
  Modal.info({
    title: `${$t('evie.version.versionNo')} #${row.versionNo}`,
    width: 720,
    content: () =>
      h('pre', { class: 'max-h-96 overflow-auto whitespace-pre-wrap text-xs' }, row.snapshot || '-'),
  });
}

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('evie.dictionaryCenter.versions')">
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
          @click="handlePublish"
        >
          {{ $t('evie.dictionary.publishVersion') }}
        </Button>
      </template>
      <template #operation="{ row }">
        <Button size="small" type="link" @click="handleDetail(row)">
          {{ $t('common.detail') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
