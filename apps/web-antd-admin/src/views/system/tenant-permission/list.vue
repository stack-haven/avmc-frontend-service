<script lang="ts" setup>
import type { SelectProps } from 'ant-design-vue';

import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';
import type { SystemTenantApi } from '#/api/system/tenant';
import type { Recordable } from '@vben/types';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'ant-design-vue';

import { getTenantList } from '#/api/system';
import {
  getMenuPermissionGroupList,
  getMenuPermissionGroupVersions,
  getTenantPermissionGroups,
  updateTenantPermissionGroups,
  updateTenantPermissionGroupVersion,
} from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

const tenantId = ref<string>();
const groupIds = ref<number[]>([]);
const groups = ref<SystemMenuPermissionGroupApi.MenuPermissionGroup[]>([]);
const tenants = ref<SystemTenantApi.SystemTenant[]>([]);
const loading = ref(false);
const saving = ref(false);
const bindings = ref<
  SystemMenuPermissionGroupApi.TenantPermissionGroupBinding[]
>([]);
const versionOptions = ref<Record<number, { label: string; value: number }[]>>(
  {},
);

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
    bindings.value = res.bindings ?? [];
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
    await updateTenantPermissionGroups(
      tenantId.value,
      groupIds.value.map(Number),
    );
    message.success($t('system.tenantPermission.saveSuccess'));
    await loadTenantGroups();
  } finally {
    saving.value = false;
  }
}

async function loadVersionOptions(groupId: number) {
  if (versionOptions.value[groupId]) return;
  const res = await getMenuPermissionGroupVersions(groupId);
  versionOptions.value[groupId] = (res.items ?? []).map((item) => ({
    label: `v${item.version}`,
    value: Number(item.id),
  }));
}

async function changeAutoUpgrade(
  binding: SystemMenuPermissionGroupApi.TenantPermissionGroupBinding,
  autoUpgrade: boolean,
) {
  if (!tenantId.value) return;
  await updateTenantPermissionGroupVersion(tenantId.value, binding.groupId, {
    autoUpgrade,
    versionId: autoUpgrade ? undefined : binding.versionId,
  });
  await loadTenantGroups();
}

async function changePinnedVersion(
  binding: SystemMenuPermissionGroupApi.TenantPermissionGroupBinding,
  versionId: number,
) {
  if (!tenantId.value) return;
  await updateTenantPermissionGroupVersion(tenantId.value, binding.groupId, {
    autoUpgrade: false,
    versionId,
  });
  await loadTenantGroups();
}

function groupName(groupId: number) {
  const group = groups.value.find((item) => Number(item.id) === groupId);
  return group ? `${group.name} (${group.code})` : String(groupId);
}

function bindingRecord(record: Recordable<any>) {
  return record as SystemMenuPermissionGroupApi.TenantPermissionGroupBinding;
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

      <Table
        v-if="bindings.length > 0"
        :columns="[
          { key: 'group', title: $t('system.tenantPermission.package') },
          {
            dataIndex: 'version',
            title: $t('system.tenantPermission.currentVersion'),
            width: 130,
          },
          {
            dataIndex: 'autoUpgrade',
            title: $t('system.tenantPermission.autoUpgrade'),
            width: 160,
          },
          {
            key: 'pin',
            title: $t('system.tenantPermission.fixedVersion'),
            width: 180,
          },
        ]"
        :data-source="bindings"
        :pagination="false"
        row-key="groupId"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'group'">
            {{ groupName(record.groupId) }}
          </template>
          <template v-else-if="column.dataIndex === 'version'">
            <Tag color="blue">v{{ record.version ?? '-' }}</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'autoUpgrade'">
            <Switch
              :checked="record.autoUpgrade"
              :checked-children="$t('system.tenantPermission.followLatest')"
              :un-checked-children="$t('system.tenantPermission.fixed')"
              @change="
                changeAutoUpgrade(bindingRecord(record), Boolean($event))
              "
            />
          </template>
          <template v-else-if="column.key === 'pin'">
            <Select
              :disabled="record.autoUpgrade"
              :options="versionOptions[record.groupId] ?? []"
              :value="record.versionId"
              class="w-full"
              @dropdown-visible-change="
                (open) => open && loadVersionOptions(record.groupId)
              "
              @change="
                changePinnedVersion(bindingRecord(record), Number($event))
              "
            />
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>
