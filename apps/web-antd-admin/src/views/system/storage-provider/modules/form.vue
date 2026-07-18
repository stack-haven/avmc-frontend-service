<script lang="ts" setup>
import type { StorageProviderApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createStorageProvider, updateStorageProvider } from '#/api';
import { $t } from '#/locales';

import { formSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<StorageProviderApi.Provider>();
const id = ref<number>();

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: formSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const payload = normalizePayload(values);
    drawerApi.lock();
    (id.value
      ? updateStorageProvider(id.value, payload)
      : createStorageProvider(payload)
    )
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data = drawerApi.getData<StorageProviderApi.Provider>();
    formApi.resetForm();
    if (data?.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues({
        ...data,
        secretKey: '',
        sessionToken: '',
      });
    } else {
      formData.value = undefined;
      id.value = undefined;
      formApi.setValues({
        defaultBucket: 'tenant-files',
        forcePathStyle: true,
        isDefault: false,
        status: 1,
        type: 'local',
        useSsl: false,
      });
    }
  },
});

const drawerTitle = computed(() =>
  formData.value?.id
    ? $t('common.edit', $t('system.storageProvider.name'))
    : $t('common.create', $t('system.storageProvider.name')),
);

function normalizePayload(values: Record<string, any>) {
  const payload = { ...values };
  if (payload.type === 'local') {
    payload.endpoint = '';
    payload.region = '';
    payload.accessKey = '';
    payload.secretKey = '';
    payload.sessionToken = '';
    payload.useSsl = false;
    payload.forcePathStyle = true;
  }
  if (payload.type === 's3-compatible') {
    payload.localBasePath = '';
  }
  if (!payload.secretKey) delete payload.secretKey;
  if (!payload.sessionToken) delete payload.sessionToken;
  return payload;
}
</script>

<template>
  <Drawer :title="drawerTitle">
    <Form />
  </Drawer>
</template>
