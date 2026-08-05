<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api';
import type { TenantLifecycleStatus } from '#/api/system/tenant';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Select } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteTenant,
  getLifecycleStatusLabel,
  getTenantList,
  LifecycleStatusOptions,
  normalizeLifecycleStatus,
  updateTenantLifecycle,
} from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import AdminManagerModal from './modules/admin-manager-modal.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [LifecycleModal, lifecycleModalApi] = useVbenModal({
  title: $t('system.tenant.lifecycleTitle'),
  confirmText: $t('system.tenant.saveChanges'),
  onConfirm() {
    handleLifecycleConfirm();
  },
});

const lifecycleTargetRow = ref<SystemTenantApi.SystemTenant>();
const lifecycleTargetStatus = ref<TenantLifecycleStatus>();
const adminManagerOpen = ref(false);
const adminTargetRow = ref<SystemTenantApi.SystemTenant>();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createdAt', ['startCreatedAt', 'endCreatedAt']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTenantList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...formValues,
          });
        },
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemTenantApi.SystemTenant>,
});

function onActionClick(e: OnActionClickParams<SystemTenantApi.SystemTenant>) {
  switch (e.code) {
    case 'edit':
      onEdit(e.row);
      break;
    case 'delete':
      onDelete(e.row);
      break;
    case 'lifecycle':
      onLifecycle(e.row);
      break;
    case 'admins':
      adminTargetRow.value = e.row;
      adminManagerOpen.value = true;
      break;
  }
}

function onLifecycle(row: SystemTenantApi.SystemTenant) {
  lifecycleTargetRow.value = row;
  lifecycleTargetStatus.value = normalizeLifecycleStatus(row.lifecycleStatus);
  lifecycleModalApi.open();
}

async function handleLifecycleConfirm() {
  if (!lifecycleTargetRow.value || !lifecycleTargetStatus.value) return;
  try {
    await updateTenantLifecycle(
      lifecycleTargetRow.value.id,
      lifecycleTargetStatus.value,
    );
    message.success($t('common.updateSuccess'));
    lifecycleModalApi.close();
    onRefresh();
  } catch {
    message.error($t('common.updateFailed'));
  }
}

function onEdit(row: SystemTenantApi.SystemTenant) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemTenantApi.SystemTenant) {
  Modal.confirm({
    title: $t('system.tenant.deleteConfirmTitle'),
    content: $t('system.tenant.deleteConfirmContent', [row.name]),
    async onOk() {
      await deleteTenant(row.id);
      message.success($t('common.deleteSuccess'));
      onRefresh();
    },
  });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <AdminManagerModal
      v-model:open="adminManagerOpen"
      :tenant="adminTargetRow"
    />
    <LifecycleModal>
      <div class="space-y-4">
        <p class="text-muted-foreground text-sm">
          {{ $t('system.tenant.lifecycleHint') }}
        </p>
        <div v-if="lifecycleTargetRow" class="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
          {{ lifecycleTargetRow.name }} ·
          {{ getLifecycleStatusLabel(lifecycleTargetRow.lifecycleStatus) }}
        </div>
        <Select
          v-if="lifecycleTargetRow"
          v-model:value="lifecycleTargetStatus"
          :options="LifecycleStatusOptions()"
          style="width: 100%"
        />
      </div>
    </LifecycleModal>
    <Grid :table-title="$t('system.tenant.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.tenant.name')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
