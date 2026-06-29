<script setup lang="ts">
import { ref } from 'vue';
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { Button, Popconfirm, Space, Table, message } from 'ant-design-vue';
import { createDictionaryItem, deleteDictionaryItem, getDictionaryType, updateDictionaryItem } from '#/api';
import { $t } from '#/locales';
import { itemFormSchema } from '../data';
const emit = defineEmits<{ success: [] }>();
const type = ref<any>({});
const editing = ref<any>();
const [Form, formApi] = useVbenForm({ schema: itemFormSchema(), showDefaultActions: false });
async function load() { type.value = await getDictionaryType(Number(drawerApi.getData<any>().id)); }
async function edit(row?: any) { editing.value = row; await formApi.resetForm(); await formApi.setValues(row ?? { typeId: type.value.id }); }
async function save() { const { valid } = await formApi.validate(); if (!valid) return; const values = { ...(await formApi.getValues()), typeId: type.value.id } as any; editing.value?.id ? await updateDictionaryItem(editing.value.id, values) : await createDictionaryItem(values); message.success($t('common.success')); await load(); emit('success'); await edit(); }
async function remove(id: number) { await deleteDictionaryItem(id); await load(); emit('success'); }
const [Drawer, drawerApi] = useVbenDrawer({ async onOpenChange(open) { if (open) { await load(); await edit(); } }, onConfirm: save });
</script>
<template><Drawer :title="$t('system.dictionary.items')">
  <Space direction="vertical" class="w-full">
    <Form />
    <Button type="primary" @click="save">{{ editing?.id ? $t('common.save') : $t('common.create') }}</Button>
    <Table :data-source="type.items ?? []" :pagination="false" row-key="id" size="small">
      <Table.Column data-index="label" :title="$t('system.dictionary.itemLabel')" />
      <Table.Column data-index="value" :title="$t('system.dictionary.itemValue')" />
      <Table.Column :title="$t('system.dictionary.operation')"><template #default="{ record }"><Space><Button type="link" @click="edit(record)">{{ $t('common.edit') }}</Button><Popconfirm :title="$t('common.delete')" @confirm="remove(record.id)"><Button danger type="link">{{ $t('common.delete') }}</Button></Popconfirm></Space></template></Table.Column>
    </Table>
  </Space>
</Drawer></template>

