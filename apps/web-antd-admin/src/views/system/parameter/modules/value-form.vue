<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { Input, InputNumber, Switch, message } from 'ant-design-vue';

import type { ParameterApi } from '#/api';

import { setCurrentTenantParameter } from '#/api';
import { $t } from '#/locales';

const emit = defineEmits<{ success: [] }>();
const current = ref<ParameterApi.Resolved>();
const textValue = ref('');
const numberValue = ref<number>();
const booleanValue = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(open) {
    if (!open) return;
    current.value = drawerApi.getData<ParameterApi.Resolved>();
    const value = current.value?.value ?? '';
    textValue.value = value;
    numberValue.value = Number(value);
    booleanValue.value = value === 'true';
  },
  async onConfirm() {
    if (!current.value) return;
    let value = textValue.value;
    if (current.value.valueType === 'PARAMETER_VALUE_TYPE_INTEGER') {
      value = String(numberValue.value ?? '');
    }
    if (current.value.valueType === 'PARAMETER_VALUE_TYPE_BOOLEAN') {
      value = String(booleanValue.value);
    }
    drawerApi.lock();
    try {
      await setCurrentTenantParameter(current.value.key, value);
      message.success($t('system.parameter.overrideSuccess'));
      emit('success');
      drawerApi.close();
    } finally {
      drawerApi.unlock();
    }
  },
});
</script>

<template>
  <Drawer :title="$t('system.parameter.override')">
    <div v-if="current" class="space-y-4">
      <div>
        <div class="text-muted-foreground text-sm">
          {{ $t('system.parameter.key') }}
        </div>
        <div class="font-mono">{{ current.key }}</div>
      </div>
      <InputNumber
        v-if="current.valueType === 'PARAMETER_VALUE_TYPE_INTEGER'"
        v-model:value="numberValue"
        class="w-full"
      />
      <Switch
        v-else-if="current.valueType === 'PARAMETER_VALUE_TYPE_BOOLEAN'"
        v-model:checked="booleanValue"
      />
      <Input.TextArea
        v-else
        v-model:value="textValue"
        :auto-size="{ minRows: 4, maxRows: 14 }"
      />
    </div>
  </Drawer>
</template>
