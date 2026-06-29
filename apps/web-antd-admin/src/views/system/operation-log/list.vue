<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getOperationLogList } from '#/api';
import { $t } from '#/locales';
import { columns, searchSchema } from './data';
const [Grid] = useVbenVxeGrid({ formOptions: { schema: searchSchema(), submitOnChange: true }, gridOptions: { columns, height: 'auto', proxyConfig: { ajax: { query: async ({ page }: any, values: Record<string, any>) => getOperationLogList({ pageSize: page.pageSize, pageToken: String((page.currentPage - 1) * page.pageSize), ...values }) }, response: { list: 'items' } }, rowConfig: { keyField: 'id' }, toolbarConfig: { custom: true, export: false, refresh: true, search: true, zoom: true } } as any });
</script>
<template><Page auto-content-height><Grid :table-title="$t('system.operationLog.list')" /></Page></template>
