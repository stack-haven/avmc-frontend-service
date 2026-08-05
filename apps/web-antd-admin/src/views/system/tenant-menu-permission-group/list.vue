<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemTenantTenantMenuPermissionGroupApi } from '#/api/system/tenant-menu-permission-group';
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Input,
  message,
  Modal,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { ApiType } from '#/api';
import {
  deleteTenantMenuPermissionGroup,
  getTenantTenantMenuPermissionGroupVersions,
  getTenantMenuPermissionGroupList,
  publishTenantTenantMenuPermissionGroupVersion,
  rollbackTenantTenantMenuPermissionGroupVersion,
  updateTenantMenuPermissionGroupStatus,
} from '#/api/system/tenant-menu-permission-group';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';
import MenuPermissionModal from './modules/menu-permission-modal.vue';

const versionModalOpen = ref(false);
const publishModalOpen = ref(false);
const selectedGroup = ref<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>();
const versions = ref<SystemTenantTenantMenuPermissionGroupApi.TenantTenantMenuPermissionGroupVersion[]>(
  [],
);
const versionLoading = ref(false);
const publishLoading = ref(false);
const publishSummary = ref('');
const publishApiPermissionsText = ref('');
const publishFeatureFlagsText = ref('{}');
const publishResourceQuotasText = ref('{}');
const menuPermissionOpen = ref(false);
const menuPermissionGroup = ref<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>();

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getTenantMenuPermissionGroupList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
      response: {
        list: 'items',
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>,
});

function onActionClick(
  e: OnActionClickParams<SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
    case 'menuPermissions': {
      openMenuPermissions(e.row);
      break;
    }
    case 'versions': {
      openVersions(e.row);
      break;
    }
  }
}

async function openVersions(
  row: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
) {
  selectedGroup.value = row;
  versionModalOpen.value = true;
  versionLoading.value = true;
  try {
    const res = await getTenantTenantMenuPermissionGroupVersions(row.id);
    versions.value = res.items ?? [];
  } finally {
    versionLoading.value = false;
  }
}

async function openPublish() {
  if (!selectedGroup.value) return;
  publishSummary.value = '';
  publishApiPermissionsText.value = (
    selectedGroup.value.apiPermissions ?? []
  ).join('\n');
  publishFeatureFlagsText.value = JSON.stringify(
    selectedGroup.value.featureFlags ?? {},
    null,
    2,
  );
  publishResourceQuotasText.value = JSON.stringify(
    selectedGroup.value.resourceQuotas ?? {},
    null,
    2,
  );
  publishModalOpen.value = true;
}

async function publishVersion() {
  const menuIds = selectedGroup.value?.menuIds?.map(Number) ?? [];
  if (!selectedGroup.value || menuIds.length === 0) {
    message.warning($t('system.tenantMenuPermissionGroup.menuRequired'));
    return;
  }
  let apiPermissions: string[];
  let featureFlags: Record<string, boolean>;
  let resourceQuotas: Record<string, number>;
  try {
    apiPermissions = parseList(publishApiPermissionsText.value);
    featureFlags = parseBoolRecord(publishFeatureFlagsText.value);
    resourceQuotas = parseNumberRecord(publishResourceQuotasText.value);
  } catch {
    message.warning($t('system.tenantMenuPermissionGroup.capabilityJsonInvalid'));
    return;
  }
  publishLoading.value = true;
  try {
    await publishTenantTenantMenuPermissionGroupVersion(selectedGroup.value.id, {
      apiPermissions,
      changeSummary: publishSummary.value,
      featureFlags,
      menuIds,
      resourceQuotas,
    });
    publishModalOpen.value = false;
    await openVersions(selectedGroup.value);
    onRefresh();
  } finally {
    publishLoading.value = false;
  }
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

async function rollbackVersion(
  version: SystemTenantTenantMenuPermissionGroupApi.TenantTenantMenuPermissionGroupVersion,
) {
  if (!selectedGroup.value) return;
  await rollbackTenantTenantMenuPermissionGroupVersion(selectedGroup.value.id, version.id);
  message.success($t('system.tenantMenuPermissionGroup.rollbackSuccess'));
  await openVersions(selectedGroup.value);
  onRefresh();
}

function rollbackVersionRecord(record: Recordable<any>) {
  return rollbackVersion(
    record as SystemTenantTenantMenuPermissionGroupApi.TenantTenantMenuPermissionGroupVersion,
  );
}

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('cancelled'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

async function onStatusChange(
  newStatus: string,
  row: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
) {
  const status = ApiType.StatusOptions().find(
    (item) => item.value === newStatus,
  );
  try {
    await confirm(
      $t('system.tenantMenuPermissionGroup.statusChangeConfirm', [
        row.name,
        status?.label,
      ]),
      $t('system.tenantMenuPermissionGroup.statusChangeTitle'),
    );
    await updateTenantMenuPermissionGroupStatus(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup) {
  formDrawerApi.setData(row).open();
}

function openMenuPermissions(
  row: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup,
) {
  menuPermissionGroup.value = row;
  menuPermissionOpen.value = true;
}

function onDelete(row: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteTenantMenuPermissionGroup(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
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
    <MenuPermissionModal
      v-model:open="menuPermissionOpen"
      :group="menuPermissionGroup"
      @success="onRefresh"
    />
    <Grid :table-title="$t('system.tenantMenuPermissionGroup.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('system.tenantMenuPermissionGroup.name')])
          }}
        </Button>
      </template>
    </Grid>
    <Modal
      v-model:open="versionModalOpen"
      :footer="null"
      :title="$t('system.tenantMenuPermissionGroup.versionHistory')"
      width="820px"
    >
      <div class="mb-4 flex justify-end">
        <Button type="primary" @click="openPublish">
          <Plus class="size-4" />
          {{ $t('system.tenantMenuPermissionGroup.publishVersion') }}
        </Button>
      </div>
      <Table
        :columns="[
          {
            dataIndex: 'version',
            title: $t('system.tenantMenuPermissionGroup.version'),
            width: 90,
          },
          {
            dataIndex: 'state',
            title: $t('system.tenantMenuPermissionGroup.versionState'),
            width: 110,
          },
          {
            dataIndex: 'menuIds',
            title: $t('system.tenantMenuPermissionGroup.menuCount'),
            width: 100,
          },
          {
            dataIndex: 'changeSummary',
            title: $t('system.tenantMenuPermissionGroup.changeSummary'),
          },
          {
            dataIndex: 'publishedAt',
            title: $t('system.tenantMenuPermissionGroup.publishedAt'),
            width: 180,
          },
          {
            key: 'action',
            title: $t('system.tenantMenuPermissionGroup.operation'),
            width: 100,
          },
        ]"
        :data-source="versions"
        :loading="versionLoading"
        :pagination="false"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'version'">
            <Tag color="blue">v{{ record.version }}</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'state'">
            {{
              record.state === 1
                ? $t('system.tenantMenuPermissionGroup.published')
                : $t('system.tenantMenuPermissionGroup.superseded')
            }}
          </template>
          <template v-else-if="column.dataIndex === 'menuIds'">
            {{ record.menuIds?.length ?? 0 }}
          </template>
          <template v-else-if="column.key === 'action'">
            <Button
              :disabled="record.state === 1"
              size="small"
              type="link"
              @click="rollbackVersionRecord(record)"
            >
              {{ $t('system.tenantMenuPermissionGroup.rollback') }}
            </Button>
          </template>
        </template>
      </Table>
    </Modal>
    <Modal
      v-model:open="publishModalOpen"
      :confirm-loading="publishLoading"
      :title="$t('system.tenantMenuPermissionGroup.publishVersion')"
      @ok="publishVersion"
    >
      <Space class="w-full" direction="vertical" size="middle">
        <div class="rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div class="text-sm font-medium">
            {{ $t('system.tenantMenuPermissionGroup.menuPermissionTitle') }}
          </div>
          <div class="text-muted-foreground mt-1 text-xs">
            {{
              $t('system.tenantMenuPermissionGroup.publishMenuSummary', [
                selectedGroup?.menuIds?.length ?? 0,
              ])
            }}
          </div>
        </div>
        <Input
          v-model:value="publishSummary"
          :placeholder="$t('system.tenantMenuPermissionGroup.changeSummary')"
        />
        <Input.TextArea
          v-model:value="publishApiPermissionsText"
          :placeholder="$t('system.tenantMenuPermissionGroup.apiPermissions')"
          :rows="3"
        />
        <Input.TextArea
          v-model:value="publishFeatureFlagsText"
          :placeholder="$t('system.tenantMenuPermissionGroup.featureFlags')"
          :rows="3"
        />
        <Input.TextArea
          v-model:value="publishResourceQuotasText"
          :placeholder="$t('system.tenantMenuPermissionGroup.resourceQuotas')"
          :rows="3"
        />
      </Space>
    </Modal>
  </Page>
</template>
