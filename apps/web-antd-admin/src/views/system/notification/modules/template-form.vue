<script lang="ts" setup>
import type { NotificationApi } from '#/api';

import { computed } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import {
  createNotificationTemplate,
  updateNotificationTemplate,
} from '#/api';
import { $t } from '#/locales';

import { templateFormSchema } from '../data';

const emits = defineEmits(['success']);

const current = computed<Partial<NotificationApi.Template>>(
  () => drawerApi.getData<NotificationApi.Template>() ?? {},
);

const [Form, formApi] = useVbenForm({
  commonConfig: { formItemClass: 'col-span-2' },
  layout: 'vertical',
  schema: templateFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    try {
      if (current.value.id) {
        await updateNotificationTemplate(current.value.id, values as any);
      } else {
        await createNotificationTemplate(values as any);
      }
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(open) {
    if (!open) return;
    await formApi.resetForm();
    if (current.value.id) {
      await formApi.setValues(current.value);
    } else {
      await formApi.setValues({
        channel: 'NOTIFICATION_CHANNEL_IN_APP',
        locale: 'zh-CN',
        status: 1,
      });
    }
  },
});
</script>

<template>
  <Drawer
    :title="
      current.id
        ? $t('common.edit', $t('system.notification.template'))
        : $t('common.create', $t('system.notification.template'))
    "
  >
    <Form />
  </Drawer>
</template>
