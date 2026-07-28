<script setup lang="ts">
import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';
import { createWebhookSubscription, updateWebhookSubscription, type WebhookApi } from '#/api';
import { $t } from '#/locales';
import { formSchema } from '../data';

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { allowClear: true } },
  schema: formSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel() {
    drawerApi.close();
  },
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const data = await formApi.getValues() as WebhookApi.Subscription;
    const subscription = { ...data, secret: data.secret || '' };
    try {
      if (drawerApi.getData()?.id) {
        await updateWebhookSubscription(drawerApi.getData<WebhookApi.Subscription>().id, subscription);
      } else {
        await createWebhookSubscription(subscription);
      }
      drawerApi.close();
    } catch (_) {
      // error handled by request interceptor
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const row = drawerApi.getData<WebhookApi.Subscription>();
      if (row) {
        formApi.setValues({ ...row, secret: '' });
      } else {
        formApi.resetForm();
      }
    }
  },
  title: $t('system.webhook.subscriptionForm'),
});
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
