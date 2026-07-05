<script setup lang="ts">
import { computed } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import {
  createParameterDefinition,
  getParameterDefinition,
  updateParameterDefinition,
} from '#/api';
import { $t } from '#/locales';

import { definitionFormSchema } from '../data';

const emit = defineEmits<{ success: [] }>();
const current = computed<any>(() => drawerApi.getData() ?? {});
const [Form, formApi] = useVbenForm({
  commonConfig: { formItemClass: 'col-span-2' },
  schema: definitionFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});
const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) {
    if (!open) return;
    const row = drawerApi.getData<any>();
    await formApi.resetForm();
    if (row?.id) {
      await formApi.setValues(await getParameterDefinition(Number(row.id)));
    }
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    drawerApi.lock();
    try {
      const values = await formApi.getValues();
      if (current.value.id) {
        await updateParameterDefinition(Number(current.value.id), values as any);
      } else {
        await createParameterDefinition(values as any);
      }
      emit('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
});
</script>

<template>
  <Drawer :title="current.id ? $t('common.edit') : $t('common.create')">
    <Form />
  </Drawer>
</template>
