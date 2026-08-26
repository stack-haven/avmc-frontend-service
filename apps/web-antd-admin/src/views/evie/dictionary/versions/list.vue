<script setup lang="ts">
import { h, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Button, Modal, Select, Textarea, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictionaryList, getVersionList, publishDictionary } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';

defineOptions({ name: 'EvieVersionList' });

const publishOpen = ref(false);
const publishDictId = ref<number>();
const publishDesc = ref('');
const dictOptions = ref<{ label: string; value: number }[]>([]);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) => {
          const dictionaryId = values.dictionaryId || 0;
          const resp = await getVersionList(dictionaryId, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
            dictionaryId: undefined,
          });
          return { items: resp.versions, total: resp.total };
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

function handlePublish() {
  publishOpen.value = true;
  publishDesc.value = '';
}

async function confirmPublish() {
  if (!publishDictId.value) {
    message.warning($t('evie.dictionary.selectDictionary'));
    return;
  }
  await publishDictionary(publishDictId.value, publishDesc.value || undefined);
  message.success($t('ui.actionMessage.operationSuccess'));
  publishOpen.value = false;
  refresh();
}

function handleDetail(row: any) {
  Modal.info({
    title: `${$t('evie.version.versionNo')} #${row.versionNo}`,
    width: 720,
    content: () =>
      h('pre', { class: 'max-h-96 overflow-auto whitespace-pre-wrap text-xs' }, row.snapshot || '-'),
  });
}

async function loadDictionaries() {
  const resp = await getDictionaryList({ pageSize: 200 });
  dictOptions.value = resp.dictionaries.map((d: any) => ({
    label: d.name,
    value: d.id,
  }));
  gridApi.formApi.updateSchema([
    {
      fieldName: 'dictionaryId',
      componentProps: { options: dictOptions.value, showSearch: true, optionFilterProp: 'label' },
    },
  ]);
}

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('evie.dictionaryCenter.versions')">
      <template #toolbar-tools>
        <Button type="primary" @click="handlePublish">
          {{ $t('evie.dictionary.publishVersion') }}
        </Button>
      </template>
      <template #operation="{ row }">
        <Button size="small" type="link" @click="handleDetail(row)">
          {{ $t('common.detail') }}
        </Button>
      </template>
    </Grid>

    <Modal
      v-model:open="publishOpen"
      :title="$t('evie.dictionary.publishVersion')"
      :ok-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @ok="confirmPublish"
    >
      <div class="space-y-4 py-2">
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('evie.dictionary.name') }}
          </div>
          <Select
            v-model:value="publishDictId"
            class="w-full"
            :options="dictOptions"
            :placeholder="$t('evie.dictionary.selectDictionary')"
            show-search
            option-filter-prop="label"
          />
        </div>
        <div>
          <div class="mb-1 text-sm font-medium">
            {{ $t('evie.version.description') }}
          </div>
          <Textarea
            v-model:value="publishDesc"
            :placeholder="$t('evie.dictionary.publishVersionHint')"
            :rows="3"
          />
        </div>
      </div>
    </Modal>
  </Page>
</template>
