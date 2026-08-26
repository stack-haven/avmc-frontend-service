<script setup lang="ts">
import { h, onMounted } from 'vue';

import { Page } from '@vben/common-ui';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getDictionaryList, getVersionList, publishDictionary } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';

defineOptions({ name: 'EvieVersionList' });

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

async function handlePublish() {
  const values = await gridApi.formApi.getValues();
  const dictionaryId = values.dictionaryId;
  if (!dictionaryId) {
    message.warning($t('evie.dictionary.selectDictionary'));
    return;
  }
  Modal.confirm({
    title: $t('evie.dictionary.publishVersion'),
    content: $t('evie.dictionary.publishVersionHint'),
    async onOk() {
      await publishDictionary(dictionaryId);
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
  </Page>
</template>
