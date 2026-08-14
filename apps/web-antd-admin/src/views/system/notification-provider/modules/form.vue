<script lang="ts" setup>
import type { NotificationProviderApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createNotificationProvider,
  updateNotificationProvider,
} from '#/api';
import { $t } from '#/locales';

import { formSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<NotificationProviderApi.Provider>();
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
      ? updateNotificationProvider(id.value, payload)
      : createNotificationProvider(payload)
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
    const data = drawerApi.getData<NotificationProviderApi.Provider>();
    formApi.resetForm();
    if (data?.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues({ ...data, accessKeySecret: '' });
    } else {
      formData.value = undefined;
      id.value = undefined;
      formApi.setValues({ channel: 'sms', isDefault: false, status: 1 });
    }
  },
});

const drawerTitle = computed(() =>
  formData.value?.id
    ? $t('common.edit', [$t('system.notificationProvider.name')])
    : $t('common.create', [$t('system.notificationProvider.name')]),
);

function normalizePayload(values: Record<string, any>) {
  const payload = { ...values };
  if (payload.channel === 'in-app') {
    payload.providerType = '';
  }
  if (payload.channel !== 'sms') {
    payload.endpoint = '';
    payload.accessKeyId = '';
    payload.accessKeySecret = '';
    payload.signName = '';
    payload.templateCode = '';
  }
  if (!payload.accessKeySecret) delete payload.accessKeySecret;
  return payload;
}
</script>

<template>
  <Drawer :title="drawerTitle">
    <Form />
  </Drawer>
</template>
