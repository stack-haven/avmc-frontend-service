<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';

import { computed, markRaw } from 'vue';

import { AuthenticationLogin, SliderCaptcha, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { searchTenantsByName } from '#/api/system/tenant';
import { useAuthStore } from '#/store';

defineOptions({ name: 'Login' });

const authStore = useAuthStore();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.tenantPlaceholder'),
      },
      fieldName: 'tenant',
      label: $t('authentication.tenant'),
      rules: z.string().min(1, { message: $t('authentication.tenantRequired') }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: $t('authentication.usernameTip'),
      },
      fieldName: 'username',
      label: $t('authentication.username'),
      rules: z.string().min(1, { message: $t('authentication.usernameTip') }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('authentication.password'),
      },
      fieldName: 'password',
      label: $t('authentication.password'),
      rules: z.string().min(1, { message: $t('authentication.passwordTip') }),
    },
    {
      component: markRaw(SliderCaptcha),
      fieldName: 'captcha',
      rules: z.boolean().refine((value) => value, {
        message: $t('authentication.verifyRequiredTip'),
      }),
    },
  ];
});

async function handleLogin(values: Record<string, any>) {
  const { tenant, username, password } = values;

  // Resolve tenant name to ID
  try {
    const res = await searchTenantsByName({ name: tenant, pageSize: 1 });
    if (!res.items || res.items.length === 0) {
      message.error('未找到匹配的租户，请检查租户名称');
      return;
    }
    const tenantId = res.items[0]!.id;
    authStore.authLogin({ tenantId, username, password });
  } catch {
    message.error('租户查询失败，请稍后重试');
  }
}
</script>

<template>
  <AuthenticationLogin
    :form-schema="formSchema"
    :loading="authStore.loginLoading"
    @submit="handleLogin" />
</template>
