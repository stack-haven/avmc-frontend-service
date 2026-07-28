<script lang="ts" setup>
import type { SystemTenantApi } from '#/api';
import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Alert, Select, Steps, Tag, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createTenant, getTenant, updateTenant } from '#/api';
import { getMenuPermissionGroupList } from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

import { useAdminFormSchema, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemTenantApi.SystemTenant>();
const currentStep = ref(0);
const packageOptions = ref<{ label: string; value: number }[]>([]);
const packages = ref<SystemMenuPermissionGroupApi.MenuPermissionGroup[]>([]);
const selectedGroupIds = ref<number[]>([]);

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useFormSchema(),
  showDefaultActions: false,
});
const [AdminForm, adminFormApi] = useVbenForm({
  layout: 'vertical',
  schema: useAdminFormSchema(),
  showDefaultActions: false,
});

const id = ref<string>();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    if (currentStep.value === 0) {
      const { valid } = await formApi.validate();
      if (!valid) return;
      currentStep.value = 1;
      return;
    }
    if (selectedGroupIds.value.length === 0) {
      message.warning($t('system.tenant.packageRequired'));
      return;
    }
    if (!id.value && currentStep.value === 1) {
      currentStep.value = 2;
      return;
    }
    const values = (await formApi.getValues()) as Omit<
      SystemTenantApi.SystemTenant,
      'id'
    >;
    values.groupIds = selectedGroupIds.value.map(Number);
    let initialAdmin: SystemTenantApi.InitialAdmin | undefined;
    if (!id.value) {
      const { valid } = await adminFormApi.validate();
      if (!valid) return;
      initialAdmin =
        (await adminFormApi.getValues()) as SystemTenantApi.InitialAdmin;
    }

    drawerApi.lock();
    const request = id.value
      ? updateTenant(id.value, values)
      : createTenant(values, initialAdmin!);
    request
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<SystemTenantApi.SystemTenant>();
      formApi.resetForm();
      adminFormApi.resetForm();
      currentStep.value = 0;
      try {
        await loadPackages();
      } catch (_) {
        packages.value = [];
        packageOptions.value = [];
      }
      if (data?.id) {
        try {
          const detail = await getTenant(data.id);
          formData.value = detail;
          id.value = data.id;
          formApi.setValues(detail);
          selectedGroupIds.value = await resolveTenantGroupIds(detail);
        } catch {
          message.error($t('system.tenant.loadError'));
        }
      } else {
        formData.value = undefined;
        id.value = undefined;
        selectedGroupIds.value = [];
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.tenant.name'))
    : $t('common.create', $t('system.tenant.name'));
});

const selectedPackages = computed(() => {
  const selected = new Set(selectedGroupIds.value);
  return packages.value.filter((item) => selected.has(Number(item.id)));
});

async function loadPackages() {
  const resp = await getMenuPermissionGroupList({
    nopaging: true,
  });
  packages.value = resp.items ?? [];
  packageOptions.value = packages.value.map((item) => ({
    label: item.name,
    value: Number(item.id),
  }));
}

async function resolveTenantGroupIds(data: SystemTenantApi.SystemTenant) {
  if (data.groupIds?.length) {
    return data.groupIds.map(Number);
  }
  if (data.groups?.length) {
    return data.groups.map((item) => Number(item.id));
  }
  return [];
}
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Steps
      :current="currentStep"
      :items="[
        { title: $t('system.tenant.baseInfoStep') },
        { title: $t('system.tenant.packageStep') },
        ...(!id ? [{ title: $t('system.tenant.adminStep') }] : []),
      ]"
      class="mb-6"
      size="small"
    />
    <Form v-show="currentStep === 0" />
    <div v-show="currentStep === 1" class="space-y-4">
      <Alert :message="$t('system.tenant.packageHelp')" show-icon type="info" />
      <Select
        v-model:value="selectedGroupIds"
        :options="packageOptions"
        :placeholder="$t('system.tenant.packagePlaceholder')"
        class="w-full"
        mode="multiple"
      />
      <div v-if="selectedPackages.length > 0" class="flex flex-wrap gap-2">
        <Tag v-for="item in selectedPackages" :key="item.id" color="blue">
          {{ item.name }}
        </Tag>
      </div>
    </div>
    <div v-show="currentStep === 2">
      <Alert
        :message="$t('system.tenant.adminHelp')"
        class="mb-4"
        show-icon
        type="warning"
      />
      <AdminForm />
    </div>
  </Drawer>
</template>
