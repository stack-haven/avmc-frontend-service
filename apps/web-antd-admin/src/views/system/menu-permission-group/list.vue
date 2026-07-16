<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';
import type { SystemMenuApi } from '#/api/system/menu';
import type { Recordable } from '@vben/types';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import {
  Button,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { ApiType } from '#/api';
import {
  deleteMenuPermissionGroup,
  getMenuPermissionGroupVersions,
  getMenuPermissionGroupList,
  publishMenuPermissionGroupVersion,
  rollbackMenuPermissionGroupVersion,
  updateMenuPermissionGroupStatus,
} from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const versionModalOpen = ref(false);
const publishModalOpen = ref(false);
const selectedGroup = ref<SystemMenuPermissionGroupApi.MenuPermissionGroup>();
const versions = ref<SystemMenuPermissionGroupApi.MenuPermissionGroupVersion[]>(
  [],
);
const versionLoading = ref(false);
const publishLoading = ref(false);
const publishMenuIds = ref<number[]>([]);
const publishSummary = ref('');
const publishApiPermissionsText = ref('');
const publishFeatureFlagsText = ref('{}');
const publishResourceQuotasText = ref('{}');
const menuOptions = ref<{ label: string; value: number }[]>([]);

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
          return await getMenuPermissionGroupList({
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
  } as VxeTableGridOptions<SystemMenuPermissionGroupApi.MenuPermissionGroup>,
});

function onActionClick(
  e: OnActionClickParams<SystemMenuPermissionGroupApi.MenuPermissionGroup>,
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
    case 'versions': {
      openVersions(e.row);
      break;
    }
  }
}

async function openVersions(
  row: SystemMenuPermissionGroupApi.MenuPermissionGroup,
) {
  selectedGroup.value = row;
  versionModalOpen.value = true;
  versionLoading.value = true;
  try {
    const res = await getMenuPermissionGroupVersions(row.id);
    versions.value = res.items ?? [];
  } finally {
    versionLoading.value = false;
  }
}

async function openPublish() {
  if (!selectedGroup.value) return;
  if (menuOptions.value.length === 0) {
    const { getMenuList } = await import('#/api/system/menu');
    const res = await getMenuList();
    const items = Array.isArray(res) ? res : (res.items ?? []);
    const flatten = (
      menus: SystemMenuApi.SystemMenu[],
    ): SystemMenuApi.SystemMenu[] =>
      menus.flatMap((item) => [item, ...flatten(item.children ?? [])]);
    menuOptions.value = flatten(items).map((item) => ({
      label: item.meta?.title ?? item.name,
      value: Number(item.id),
    }));
  }
  publishMenuIds.value = selectedGroup.value.menuIds?.map(Number) ?? [];
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
  if (!selectedGroup.value || publishMenuIds.value.length === 0) {
    message.warning($t('system.menuPermissionGroup.menuRequired'));
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
    message.warning($t('system.menuPermissionGroup.capabilityJsonInvalid'));
    return;
  }
  publishLoading.value = true;
  try {
    await publishMenuPermissionGroupVersion(selectedGroup.value.id, {
      apiPermissions,
      changeSummary: publishSummary.value,
      featureFlags,
      menuIds: publishMenuIds.value,
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
  version: SystemMenuPermissionGroupApi.MenuPermissionGroupVersion,
) {
  if (!selectedGroup.value) return;
  await rollbackMenuPermissionGroupVersion(selectedGroup.value.id, version.id);
  message.success($t('system.menuPermissionGroup.rollbackSuccess'));
  await openVersions(selectedGroup.value);
  onRefresh();
}

function rollbackVersionRecord(record: Recordable<any>) {
  return rollbackVersion(
    record as SystemMenuPermissionGroupApi.MenuPermissionGroupVersion,
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
  row: SystemMenuPermissionGroupApi.MenuPermissionGroup,
) {
  const status = ApiType.StatusOptions().find(
    (item) => item.value === newStatus,
  );
  try {
    await confirm(
      $t('system.menuPermissionGroup.statusChangeConfirm', [
        row.name,
        status?.label,
      ]),
      $t('system.menuPermissionGroup.statusChangeTitle'),
    );
    await updateMenuPermissionGroupStatus(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemMenuPermissionGroupApi.MenuPermissionGroup) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemMenuPermissionGroupApi.MenuPermissionGroup) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenuPermissionGroup(row.id)
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
    <Grid :table-title="$t('system.menuPermissionGroup.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('system.menuPermissionGroup.name')])
          }}
        </Button>
      </template>
    </Grid>
    <Modal
      v-model:open="versionModalOpen"
      :footer="null"
      :title="$t('system.menuPermissionGroup.versionHistory')"
      width="820px"
    >
      <div class="mb-4 flex justify-end">
        <Button type="primary" @click="openPublish">
          <Plus class="size-4" />
          {{ $t('system.menuPermissionGroup.publishVersion') }}
        </Button>
      </div>
      <Table
        :columns="[
          {
            dataIndex: 'version',
            title: $t('system.menuPermissionGroup.version'),
            width: 90,
          },
          {
            dataIndex: 'state',
            title: $t('system.menuPermissionGroup.versionState'),
            width: 110,
          },
          {
            dataIndex: 'menuIds',
            title: $t('system.menuPermissionGroup.menuCount'),
            width: 100,
          },
          {
            dataIndex: 'changeSummary',
            title: $t('system.menuPermissionGroup.changeSummary'),
          },
          {
            dataIndex: 'publishedAt',
            title: $t('system.menuPermissionGroup.publishedAt'),
            width: 180,
          },
          {
            key: 'action',
            title: $t('common.action'),
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
                ? $t('system.menuPermissionGroup.published')
                : $t('system.menuPermissionGroup.superseded')
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
              {{ $t('system.menuPermissionGroup.rollback') }}
            </Button>
          </template>
        </template>
      </Table>
    </Modal>
    <Modal
      v-model:open="publishModalOpen"
      :confirm-loading="publishLoading"
      :title="$t('system.menuPermissionGroup.publishVersion')"
      @ok="publishVersion"
    >
      <Space class="w-full" direction="vertical" size="middle">
        <Select
          v-model:value="publishMenuIds"
          :options="menuOptions"
          class="w-full"
          mode="multiple"
          :placeholder="$t('system.menuPermissionGroup.menus')"
        />
        <Input
          v-model:value="publishSummary"
          :placeholder="$t('system.menuPermissionGroup.changeSummary')"
        />
        <Input.TextArea
          v-model:value="publishApiPermissionsText"
          :placeholder="$t('system.menuPermissionGroup.apiPermissions')"
          :rows="3"
        />
        <Input.TextArea
          v-model:value="publishFeatureFlagsText"
          :placeholder="$t('system.menuPermissionGroup.featureFlags')"
          :rows="3"
        />
        <Input.TextArea
          v-model:value="publishResourceQuotasText"
          :placeholder="$t('system.menuPermissionGroup.resourceQuotas')"
          :rows="3"
        />
      </Space>
    </Modal>
  </Page>
</template>
