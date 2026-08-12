<script lang="ts" setup>
import type { SystemUserApi } from '#/api';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createUser, getUser, updateUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();
const fetching = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  commonConfig: { componentProps: { class: 'w-full' } },
  showDefaultActions: false,
  wrapperClass: 'grid grid-cols-1 gap-x-6 gap-y-1 xl:grid-cols-2',
});

const id = ref<number>();
const isCreate = computed(() => !id.value);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (isCreate.value && !values.password) {
      message.error($t('system.user.passwordRequired'));
      return;
    }
    if (!isCreate.value && !values.password) delete values.password;
    drawerApi.lock();
    (isCreate.value
      ? createUser(values as Omit<SystemUserApi.SystemUser, 'id' | 'isTenantAdmin'>)
      : updateUser(id.value!, values))
      .then(() => { emits('success'); drawerApi.close(); })
      .catch(() => drawerApi.unlock());
  },
  async onOpenChange(open) {
    if (!open) return;
    const data = drawerApi.getData<SystemUserApi.SystemUser>();
    formApi.resetForm();
    fetching.value = true;

    if (data?.id) {
      id.value = data.id;
      const detail = await getUser(data.id);
      formData.value = detail;
      formApi.setValues({ ...detail, password: undefined });
    } else {
      id.value = undefined;
      formData.value = undefined;
      if (data) {
        formApi.setValues(data);
      }
    }
    fetching.value = false;
  },
});

const drawerTitle = computed(() => {
  if (formData.value?.id) return $t('system.user.editProfileTitle');
  return $t('system.user.createUserTitle');
});
</script>

<template>
  <Drawer :title="drawerTitle">
    <div class="user-form-hint">
      {{ isCreate ? $t('system.user.createUserHint') : $t('system.user.editProfileHint') }}
    </div>
    <Form>
      <template #suffix>
        <div class="text-muted-foreground text-xs">
          {{ isCreate ? $t('system.user.passwordRequired') : $t('system.user.passwordOptional') }}
        </div>
      </template>
    </Form>
  </Drawer>
</template>

<style scoped>
.user-form-hint {
  margin-bottom: 16px;
  padding: 12px 14px;
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--muted) / 0.35);
  font-size: 13px;
  line-height: 1.6;
}

:deep(.form-field-textarea) {
  grid-column: 1 / -1;
}
</style>
