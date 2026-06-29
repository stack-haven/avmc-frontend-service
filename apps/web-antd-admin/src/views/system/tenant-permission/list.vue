<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue';

import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';
import type { SystemTenantApi } from '#/api/system/tenant';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Select, Space, message } from 'ant-design-vue';

import { getTenantList } from '#/api/system';
import {
  getMenuPermissionGroupList,
  getTenantPermissionGroups,
  updateTenantPermissionGroups,
} from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

const tenantId = ref<string>();
const groupIds = ref<number[]>([]);
const groups = ref<SystemMenuPermissionGroupApi.MenuPermissionGroup[]>([]);
const tenants = ref<SystemTenantApi.SystemTenant[]>([]);
const loading = ref(false);
const saving = ref(false);

const groupOptions = computed<SelectProps['options']>(() =>
  groups.value.map((group) => ({
    label: `${group.name} (${group.code})`,
    value: Number(group.id),
  })),
);

const tenantOptions = computed<SelectProps['options']>(() =>
  tenants.value.map((tenant) => ({
    label: `${tenant.name} (${tenant.code})`,
    value: String(tenant.id),
  })),
);

async function loadGroups() {
  const res = await getMenuPermissionGroupList({ nopaging: true });
  groups.value = res.items ?? [];
}

async function loadTenants() {
  const res = await getTenantList({ nopaging: true });
  tenants.value = res.items ?? [];
}

async function loadTenantGroups() {
  if (!tenantId.value) {
    message.warning($t('system.tenantPermission.tenantRequired'));
    return;
  }
  loading.value = true;
  try {
    const res = await getTenantPermissionGroups(tenantId.value);
    groupIds.value = (res.groupIds ?? []).map(Number);
  } finally {
    loading.value = false;
  }
}

async function saveTenantGroups() {
  if (!tenantId.value) {
    message.warning($t('system.tenantPermission.tenantRequired'));
    return;
  }
  saving.value = true;
  try {
    await updateTenantPermissionGroups(tenantId.value, groupIds.value.map(Number));
    message.success($t('system.tenantPermission.saveSuccess'));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadGroups();
  loadTenants();
});
</script>

<template>
  <Page auto-content-height :title="$t('system.tenantPermission.title')">
    <div class="flex h-full flex-col gap-4">
      <Space wrap>
        <Select
          v-model:value="tenantId"
          show-search
          :filter-option="false"
          :options="tenantOptions"
          :placeholder="$t('system.tenantPermission.tenant')"
          class="w-72"
        />
        <Button :loading="loading" @click="loadTenantGroups">
          {{ $t('system.tenantPermission.load') }}
        </Button>
        <Button type="primary" :loading="saving" @click="saveTenantGroups">
          {{ $t('common.save') }}
        </Button>
      </Space>

      <Select
        v-model:value="groupIds"
        mode="multiple"
        :options="groupOptions"
        :placeholder="$t('system.tenantPermission.groups')"
        class="max-w-3xl"
      />
    </div>
  </Page>
</template>
