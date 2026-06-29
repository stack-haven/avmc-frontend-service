<script lang="ts" setup>
import type { SystemProjectApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createProject, updateProject } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemProjectApi.SystemProject>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const payload = normalizePayload(values);

    drawerApi.lock();
    (id.value ? updateProject(id.value, payload) : createProject(payload))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemProjectApi.SystemProject>();
      formApi.resetForm();
      if (data?.id) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({
          ...data,
          memberIdsText: data.memberIds?.join(','),
        });
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.project.name'))
    : $t('common.create', $t('system.project.name'));
});

function normalizePayload(values: Record<string, any>) {
  const memberIds = String(values.memberIdsText || '')
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  const payload: Record<string, any> = {
    ...values,
    memberIds,
  };

  delete payload.memberIdsText;

  return payload;
}
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
