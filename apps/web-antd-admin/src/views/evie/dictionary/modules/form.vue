<script setup lang="ts">
import type { DictionaryWord } from '#/api/evie/dictionary';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { formSchema } from '../data';

interface Props {
  data?: DictionaryWord;
}

const props = defineProps<Props>();
const emit = defineEmits<{ success: [values: Record<string, any>] }>();

const [Form, formApi] = useVbenForm({
  schema: formSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel: () => drawerApi.close(),
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const aliases = (values.aliasesText || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((alias: string) => ({ alias }));
    delete values.aliasesText;
    emit('success', { ...values, aliases });
  },
});

function open() {
  const data = props.data;
  if (data) {
    formApi.setValues({
      ...data,
      aliasesText: (data.aliases || []).map((a) => a.alias).join(','),
    });
  } else {
    formApi.resetForm();
  }
  drawerApi.open();
}

defineExpose({ open });
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
