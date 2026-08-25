<script setup lang="ts">
import type { EnhancementProfile } from '#/api/evie/enhancement';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { formSchema } from '../data';

interface Props {
  data?: EnhancementProfile;
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
    emit('success', values);
  },
});

function open() {
  const data = props.data;
  if (data?.id) {
    formApi.setValues(data);
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
