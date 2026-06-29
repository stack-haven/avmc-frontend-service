<script setup lang="ts">
import { computed } from 'vue';
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';
import { createDictionaryType, getDictionaryType, updateDictionaryType } from '#/api';
import { $t } from '#/locales';
import { typeFormSchema } from '../data';
const emit = defineEmits<{ success: [] }>();
const current = computed<any>(() => drawerApi.getData() ?? {});
const [Form, formApi] = useVbenForm({ commonConfig: { formItemClass: 'col-span-2' }, schema: typeFormSchema(), showDefaultActions: false, wrapperClass: 'grid-cols-2' });
const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) { if (!open) return; const row = drawerApi.getData<any>(); await formApi.resetForm(); if (row?.id) await formApi.setValues(await getDictionaryType(Number(row.id))); },
  async onConfirm() { const { valid } = await formApi.validate(); if (!valid) return; drawerApi.lock(); try { const values = await formApi.getValues(); current.value.id ? await updateDictionaryType(Number(current.value.id), values as any) : await createDictionaryType(values as any); emit('success'); drawerApi.close(); } finally { drawerApi.unlock(); } },
});
</script>
<template><Drawer :title="current.id ? $t('common.edit') : $t('common.create')"><Form /></Drawer></template>

