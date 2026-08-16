<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenDrawer, useVbenForm } from '@vben/common-ui';

import { Alert, message } from 'ant-design-vue';

import type { TenantProviderConfig } from '#/api';
import { updateTenantProviderConfig } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const providerName = ref('');

// 各供应商的 config_json 示例
const configHints: Record<string, string> = {
  funasr: '{"addr":"http://localhost:18000","stream_addr":"http://localhost:18001"}',
  whisper: '{"model_path":"/models/whisper-large-v3","device":"cpu"}',
  xunfei: '{"app_id":"...","api_key":"...","api_secret":"..."}',
  aliyun: '{"access_key_id":"...","access_key_secret":"...","app_key":"..."}',
};

const hint = computed(() => configHints[providerName.value] || '{}');

const [Form, formApi] = useVbenForm({
  schema: [
    {
      component: 'Textarea',
      fieldName: 'configJson',
      label: '连接配置 JSON',
      rules: 'required',
      componentProps: { rows: 5, placeholder: hint.value },
    },
    {
      component: 'InputNumber',
      fieldName: 'sampleRate',
      label: '采样率',
      defaultValue: 16000,
      componentProps: { class: 'w-full', min: 8000, max: 48000 },
    },
    {
      component: 'Input',
      fieldName: 'language',
      label: '语言',
      defaultValue: 'zh',
    },
  ],
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel: () => drawerApi.close(),
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as TenantProviderConfig;
    values.providerName = providerName.value;
    // 保留 is_active（切换开关独立管理）
    await updateTenantProviderConfig(values);
    message.success($t('common.success'));
    drawerApi.close();
    emits('success');
  },
  async onOpenChange(open) {
    if (!open) return;
    const data = drawerApi.getData<{ providerName: string; config?: TenantProviderConfig }>();
    providerName.value = data?.providerName || '';
    const c = data?.config;
    formApi.setValues({
      configJson: c?.configJson || '{}',
      sampleRate: c?.sampleRate || 16000,
      language: c?.language || 'zh',
    });
  },
});
</script>

<template>
  <Drawer :title="$t('evie.provider.config')">
    <div class="space-y-4">
      <Alert
        type="info"
        show-icon
        :message="`${providerName} 配置示例`"
        :description="hint"
      />
      <Form />
    </div>
  </Drawer>
</template>
