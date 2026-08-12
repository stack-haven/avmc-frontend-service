<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi, SystemUserApi } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Modal, Switch } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  ApiType,
  deleteUser,
  getDeptList,
  getUserList,
  updateUserStatus,
} from '#/api';
import { $t } from '#/locales';

import { deptNameMap, useColumns, useGridFormSchema } from './data';
import DeptPanel from './modules/dept-panel.vue';
import UserForm from './modules/form.vue';
import RoleForm from './modules/role-form.vue';

const [UserDrawer, userDrawerApi] = useVbenDrawer({
  connectedComponent: UserForm,
  destroyOnClose: true,
});

const [RoleModal, roleModalApi] = useVbenModal({
  connectedComponent: RoleForm,
  destroyOnClose: true,
});

const departments = ref<SystemDeptApi.SystemDept[]>([]);
const deptLoading = ref(false);
const selectedDeptId = ref<number>();

const includeChildDepts = ref(true);
const currentUserCount = ref(0);

const flatDepartments = computed(() =>
  flattenDepartments(departments.value),
);

const selectedDept = computed(() =>
  flatDepartments.value.find((item) => item.id === selectedDeptId.value),
);

const currentContextTitle = computed(() =>
  selectedDept.value?.name ?? $t('system.user.allUsers'),
);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createdAt', ['startTime', 'endTime']]],
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
          const response = await getUserList({
            ...formValues,
            deptId: selectedDeptId.value,
            includeChildDepts:
              selectedDeptId.value === undefined
                ? undefined
                : includeChildDepts.value,
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
          });
          currentUserCount.value = response.total ?? 0;
          return response;
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
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function flattenDepartments(
  items: SystemDeptApi.SystemDept[],
): SystemDeptApi.SystemDept[] {
  return items.flatMap((item) => [
    item,
    ...flattenDepartments(item.children ?? []),
  ]);
}

async function loadDepartments() {
  deptLoading.value = true;
  try {
    const response = await getDeptList();
    departments.value = response.items ?? [];
    // 同步写入模块级名称映射表，供 data.ts 的 column formatter 使用
    const newMap: Record<number, string> = {};
    for (const dept of flattenDepartments(departments.value)) {
      newMap[dept.id] = dept.name ?? '';
    }
    Object.assign(deptNameMap, newMap);
  } finally {
    deptLoading.value = false;
  }
}

async function refreshAll() {
  await Promise.all([loadDepartments(), gridApi.query()]);
}

function onDeptSelect(deptId?: number) {
  selectedDeptId.value = deptId;
  gridApi.query();
}

function onIncludeChildrenChange() {
  gridApi.query();
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  if (code === 'edit') userDrawerApi.setData(row).open();
  if (code === 'roles') roleModalApi.setData(row).open();
  if (code === 'delete') onDeleteUser(row);
}

async function onStatusChange(
  newStatus: string,
  row: SystemUserApi.SystemUser,
) {
  const status = ApiType.StatusOptions().find(
    (item) => item.value === newStatus,
  );
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: $t('system.user.statusChangeConfirm', [
        row.name,
        status?.label,
      ]),
      onCancel: () => resolve(false),
      async onOk() {
        await updateUserStatus(row.id, newStatus);
        resolve(true);
      },
      title: $t('system.user.statusChangeTitle'),
    });
  });
}

function onDeleteUser(row: SystemUserApi.SystemUser) {
  Modal.confirm({
    content: $t('system.user.deleteUserConfirm', [row.name]),
    okButtonProps: { danger: true },
    async onOk() {
      await deleteUser(row.id);
      await refreshAll();
    },
    title: $t('system.user.deleteUserTitle'),
  });
}

function createUserInContext() {
  const defaults = selectedDeptId.value
    ? ({ deptId: selectedDeptId.value } as unknown as SystemUserApi.SystemUser)
    : ({} as SystemUserApi.SystemUser);
  userDrawerApi.setData(defaults).open();
}

onMounted(loadDepartments);
</script>

<template>
  <Page auto-content-height>
    <UserDrawer @success="refreshAll" />
    <RoleModal @success="refreshAll" />

    <div class="org-workbench">
      <DeptPanel
        :departments="departments"
        :loading="deptLoading"
        @refresh="refreshAll"
        @select="onDeptSelect"
      />

      <div class="user-panel">
        <div class="user-context-card">
          <div>
            <span class="user-context__title">
              {{ currentContextTitle }}
            </span>
            <span class="user-context__count">
              {{ $t('system.user.peopleCount', [currentUserCount]) }}
            </span>
          </div>
          <div v-if="selectedDeptId" class="include-children">
            <span>{{ $t('system.user.includeChildren') }}</span>
            <Switch
              v-model:checked="includeChildDepts"
              size="small"
              @change="onIncludeChildrenChange"
            />
          </div>
        </div>
        <Grid>
          <template #toolbar-tools>
            <Button type="primary" @click="createUserInContext">
              <Plus class="size-5" />
              {{ $t('system.user.addUser') }}
            </Button>
          </template>
        </Grid>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.org-workbench {
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.user-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  height: 100%;
}

.user-context-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 280px;
  padding: 14px 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--card));
}

.user-context__title {
  font-size: 16px;
  font-weight: 600;
}

.user-context__count {
  margin-left: 10px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.include-children {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
}

@media (max-width: 900px) {
  .org-workbench {
    grid-template-columns: 1fr;
    height: auto;
  }
}
</style>
