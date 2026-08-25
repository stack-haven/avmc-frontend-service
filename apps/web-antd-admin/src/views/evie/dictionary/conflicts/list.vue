<script setup lang="ts">
import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getConflictList } from '#/api';
import { $t } from '#/locales';

import { columns } from './data';

defineOptions({ name: 'EvieConflictList' });

const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: columns(),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          const resp = await getConflictList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
          });
          return { items: resp.conflicts, total: resp.total };
        },
      },
      response: { list: 'items', total: 'total' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, zoom: true },
  } as any,
});
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('evie.dictionaryCenter.conflicts')" />
  </Page>
</template>
