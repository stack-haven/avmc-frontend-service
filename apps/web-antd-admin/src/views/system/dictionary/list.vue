<script setup lang="ts">
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDictionaryType, getDictionaryTypeList } from '#/api';
import { $t } from '#/locales';
import { columns, searchSchema } from './data';
import TypeForm from './modules/type-form.vue';
import Items from './modules/items.vue';
const [TypeDrawer, typeApi] = useVbenDrawer({ connectedComponent: TypeForm, destroyOnClose: true });
const [ItemsDrawer, itemsApi] = useVbenDrawer({ connectedComponent: Items, destroyOnClose: true });
const [Grid, gridApi] = useVbenVxeGrid({ formOptions: { schema: searchSchema(), submitOnChange: true }, gridOptions: { columns: columns(onAction), height: 'auto', proxyConfig: { ajax: { query: async ({ page }: any, values: Record<string, any>) => getDictionaryTypeList({ pageSize: page.pageSize, pageToken: String((page.currentPage - 1) * page.pageSize), ...values }) }, response: { list: 'items' } }, rowConfig: { keyField: 'id' }, toolbarConfig: { custom: true, refresh: true, search: true, zoom: true } } as any });
function refresh() { gridApi.query(); }
function onAction({ code, row }: any) { if (code === 'edit') typeApi.setData(row).open(); if (code === 'items') itemsApi.setData(row).open(); if (code === 'delete') Modal.confirm({ title: $t('common.delete'), async onOk() { await deleteDictionaryType(row.id); message.success($t('common.success')); refresh(); } }); }
</script>
<template><Page auto-content-height><TypeDrawer @success="refresh" /><ItemsDrawer @success="refresh" /><Grid :table-title="$t('system.dictionary.list')"><template #toolbar-tools><Button type="primary" @click="typeApi.setData({}).open()"><Plus class="size-5" />{{ $t('common.create') }}</Button></template></Grid></Page></template>
