<script lang="ts" setup>
import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { sendInAppNotification } from '#/api';
import { $t } from '#/locales';

import { sendFormSchema } from '../data';

const emits = defineEmits(['success']);

const [Form, formApi] = useVbenForm({
  commonConfig: { formItemClass: 'col-span-2' },
  layout: 'vertical',
  schema: sendFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    const recipientUserIds = String(values.recipientUserIdsText)
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0);
    if (recipientUserIds.length === 0) {
      await formApi.setFieldValue('recipientUserIdsText', '');
      return;
    }
    drawerApi.lock();
    try {
      await sendInAppNotification({
        businessId: values.businessId,
        businessType: values.businessType,
        content: values.content,
        idempotencyKey: `web-notification-${Date.now()}`,
        priority: values.priority,
        recipientUserIds,
        templateCode: values.templateCode,
        title: values.title,
        variables: values.variables,
      });
      emits('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(open) {
    if (!open) return;
    await formApi.resetForm();
    await formApi.setValues({ priority: 0 });
  },
});
</script>

<template>
  <Drawer :title="$t('system.notification.sendInApp')">
    <Form />
  </Drawer>
</template>
