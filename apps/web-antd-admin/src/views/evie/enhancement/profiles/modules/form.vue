<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { getPolicyList } from '#/api/evie';

import { formSchema } from '../data';

const emit = defineEmits<{ success: [values: Record<string, any>] }>();
const editId = ref<number>();
const policyOptions = ref<{ label: string; value: number }[]>([]);

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
    emit('success', { ...values, id: editId.value });
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<Record<string, any>>();
      formApi.resetForm();
      editId.value = data?.id;
      if (data?.id) {
        formApi.setValues(data);
      }
    }
  },
});

async function loadPolicies() {
  try {
    const resp = await getPolicyList({ pageSize: 100 });
    policyOptions.value = resp.policies.map((p: any) => ({
      label: `${p.name}（${p.mode}）`,
      value: p.id,
    }));
    formApi.updateSchema([
      {
        fieldName: 'policyId',
        componentProps: { options: policyOptions.value, showSearch: true, optionFilterProp: 'label' },
      },
    ]);
  } catch {
    policyOptions.value = [];
  }
}

onMounted(loadPolicies);
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
