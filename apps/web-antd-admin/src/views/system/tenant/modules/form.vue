<script lang="ts" setup>
import type { SystemTenantApi } from '#/api';
import type { SystemTenantTenantMenuPermissionGroupApi } from '#/api/system/tenant-menu-permission-group';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Select, Steps, Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getTenantMenuPermissionGroupList } from '#/api/system/tenant-menu-permission-group';
import { createTenant, updateTenant } from '#/api/system/tenant';
import { $t } from '#/locales';

import { useAdminFormSchema, useFormSchema } from '../data';

const emits = defineEmits(['success']);
const currentStep = ref(0);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [AdminForm, adminFormApi] = useVbenForm({
  schema: useAdminFormSchema(),
  showDefaultActions: false,
});

const id = ref<number>();
const packageOptions = ref<
  { label: string; value: number }[]
>([]);
const selectedPackages = ref<number[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    // Step 0: validate tenant info before advancing
    if (currentStep.value === 0) {
      const { valid } = await formApi.validate();
      if (!valid) return;
      currentStep.value = 1;
      return;
    }

    // 新建租户的第二步用于配置初始管理员；编辑租户直接进入套餐绑定。
    if (!id.value && currentStep.value === 1) {
      const { valid } = await adminFormApi.validate();
      if (!valid) return;
      currentStep.value = 2;
      return;
    }

    // Step 2: final validation + submit
    if (selectedPackages.value.length === 0) {
      return;
    }

    const tenantValues = await formApi.getValues();
    const adminValues = (id.value ? {} : await adminFormApi.getValues()) as Record<
      string,
      any
    >;

    const tenantData = {
      tenant: {
        name: tenantValues.name,
        code: tenantValues.code,
        sort: tenantValues.sort,
        remark: tenantValues.remark,
        expiresAt: tenantValues.expiresAt,
        groupIds: selectedPackages.value,
      },
      operatorId: 1,
      initialAdmin: {
        username: adminValues.username,
        password: adminValues.password,
        realname: adminValues.realname,
        email: adminValues.email,
      },
    };

    drawerApi.lock();
    try {
      if (id.value) {
        await updateTenant(id.value, {
          tenant: { ...tenantValues, groupIds: selectedPackages.value },
          operatorId: 1,
        });
      } else {
        await createTenant(tenantData);
      }
      emits('success');
      drawerApi.close();
    } catch {
      // On API error (e.g. password too weak), go back to step 1 so user can fix
      currentStep.value = id.value ? 0 : 1;
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      currentStep.value = 0;
      const data = drawerApi.getData<SystemTenantApi.SystemTenant>();
      formApi.resetForm();
      adminFormApi.resetForm();
      selectedPackages.value = [];

      if (packageOptions.value.length === 0) {
        await loadPackages();
      }

      if (data) {
        id.value = data.id;
        formApi.setValues({
          name: data.name,
          code: data.code,
          sort: data.sort ?? 10,
          remark: data.remark,
          expiresAt: data.expiresAt,
        });
        selectedPackages.value = data.groupIds ?? [];
      } else {
        id.value = undefined;
      }
    }
  },
});

async function loadPackages() {
  try {
    const res = await getTenantMenuPermissionGroupList({ nopaging: true });
    packageOptions.value = (res.items ?? []).map(
      (item: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup) => ({
        label: `${item.name} (${item.code})`,
        value: Number(item.id),
      }),
    );
  } catch {
    packageOptions.value = [];
  }
}

const getDrawerTitle = computed(() =>
  id.value
    ? $t('common.edit', [$t('system.tenant.name')])
    : $t('common.create', [$t('system.tenant.name')]),
);

const confirmText = computed(() => {
  if (currentStep.value < packageStep.value) return $t('system.tenant.stepNext');
  return $t('system.tenant.stepSubmit');
});

function handlePrev() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

const stepItems = computed(() => {
  const items = [{ title: $t('system.tenant.stepBasic') }];
  if (!id.value) items.push({ title: $t('system.tenant.stepAdmin') });
  items.push({ title: $t('system.tenant.stepPackages') });
  return items;
});

const packageStep = computed(() => (id.value ? 1 : 2));

const stepDescription = computed(() => {
  if (currentStep.value === 0) return $t('system.tenant.stepBasicHint');
  if (!id.value && currentStep.value === 1) {
    return $t('system.tenant.stepAdminHint');
  }
  return $t('system.tenant.stepPackagesHint');
});
</script>

<template>
  <Drawer :title="getDrawerTitle" :confirm-text="confirmText">
    <Steps
      :current="currentStep"
      :items="stepItems"
      size="small"
      class="mb-4"
    />

    <div class="mb-5 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm font-medium">{{ stepItems[currentStep]?.title }}</span>
        <Tag color="blue">
          {{ currentStep + 1 }} / {{ stepItems.length }}
        </Tag>
      </div>
      <p class="text-muted-foreground mb-0 mt-1 text-xs leading-5">
        {{ stepDescription }}
      </p>
    </div>

    <Form v-show="currentStep === 0" />

    <AdminForm v-if="!id" v-show="currentStep === 1" />

    <div v-show="currentStep === packageStep" class="space-y-4">
      <div class="text-muted-foreground text-sm">
        {{ $t('system.tenant.selectPackages') }}
      </div>
      <Select
        v-model:value="selectedPackages"
        mode="multiple"
        max-tag-count="responsive"
        :options="packageOptions"
        :placeholder="$t('system.tenant.packagePlaceholder')"
        style="width: 100%"
        :filter-option="
          (input: string, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        "
        show-search
      />
      <div
        v-if="selectedPackages.length === 0"
        class="text-destructive text-sm"
      >
        {{ $t('system.tenant.packageRequired') }}
      </div>
      <div v-else class="text-muted-foreground text-xs">
        {{ $t('system.tenant.packageSelected', [selectedPackages.length]) }}
      </div>
    </div>

    <template #prepend-footer>
      <Button v-if="currentStep > 0" @click="handlePrev">
        {{ $t('system.tenant.stepPrev') }}
      </Button>
    </template>
  </Drawer>
</template>
