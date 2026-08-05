<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type { SystemTenantTenantMenuPermissionGroupApi } from '#/api/system/tenant-menu-permission-group';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createTenantMenuPermissionGroup,
  updateTenantMenuPermissionGroup,
} from '#/api/system/tenant-menu-permission-group';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>();
const id = ref<string>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as Recordable<any>;
    // 菜单权限由独立模态框维护。编辑基础信息时必须保留原值，避免误清空。
    values.menuIds = (formData.value?.menuIds ?? []).map(Number);
    try {
      values.apiPermissions = parseList(values.apiPermissionsText);
      values.featureFlags = parseBoolRecord(values.featureFlagsText);
      values.resourceQuotas = parseNumberRecord(values.resourceQuotasText);
    } catch {
      message.warning($t('system.tenantMenuPermissionGroup.capabilityJsonInvalid'));
      return;
    }
    delete values.apiPermissionsText;
    delete values.featureFlagsText;
    delete values.resourceQuotasText;
    drawerApi.lock();
    (id.value
      ? updateTenantMenuPermissionGroup(
          id.value,
          values as Omit<
            SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
            'id'
          >,
        )
      : createTenantMenuPermissionGroup(
          values as Omit<
            SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
            'id'
          >,
        )
    )
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (!isOpen) return;
    const data =
      drawerApi.getData<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>();
    formApi.resetForm();
    if (data?.id) {
      formData.value = data;
      id.value = data.id;
      formApi.setValues(toFormValues(data));
    } else {
      formData.value = undefined;
      id.value = undefined;
      formApi.setValues({
        apiPermissionsText: '',
        featureFlagsText: '{}',
        resourceQuotasText: '{}',
      });
    }
  },
});

const drawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.tenantMenuPermissionGroup.name'))
    : $t('common.create', $t('system.tenantMenuPermissionGroup.name'));
});

function toFormValues(
  detail: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
) {
  return {
    ...detail,
    apiPermissionsText: (detail.apiPermissions ?? []).join('\n'),
    featureFlagsText: JSON.stringify(detail.featureFlags ?? {}, null, 2),
    resourceQuotasText: JSON.stringify(detail.resourceQuotas ?? {}, null, 2),
  };
}

function parseList(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolRecord(value: unknown): Record<string, boolean> {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, boolean>;
  const parsed = JSON.parse(String(value)) as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(parsed).map(([key, item]) => [key, Boolean(item)]),
  );
}

function parseNumberRecord(value: unknown): Record<string, number> {
  if (!value) return {};
  if (typeof value === 'object') return value as Record<string, number>;
  const parsed = JSON.parse(String(value)) as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(parsed).map(([key, item]) => [key, Number(item)]),
  );
}
</script>

<template>
  <Drawer :title="drawerTitle">
    <div class="mb-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <div class="text-sm font-medium">
        {{ $t('system.tenantMenuPermissionGroup.basicInfo') }}
      </div>
      <div class="text-muted-foreground mt-1 text-xs leading-5">
        {{ $t('system.tenantMenuPermissionGroup.basicInfoHint') }}
      </div>
    </div>
    <Form />
  </Drawer>
</template>
