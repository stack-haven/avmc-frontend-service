<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemDeptApi, SystemUserApi } from '#/api';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus, Search } from '@vben/icons';

import {
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Tag,
  Tree,
  TreeSelect,
} from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  ApiType,
  deleteDept,
  deleteUser,
  getDeptDeleteImpact,
  getDeptList,
  getUserList,
  transferAndDeleteDept,
  updateUserStatus,
} from '#/api';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import DeptForm from '../dept/modules/form.vue';
import UserForm from './modules/form.vue';

interface DeptTreeNode {
  children?: DeptTreeNode[];
  key: string;
  raw?: SystemDeptApi.SystemDept;
  title: string;
}

const departments = ref<SystemDeptApi.SystemDept[]>([]);
const departmentSearch = ref('');
const selectedKeys = ref<string[]>(['all']);
const includeChildDepts = ref(true);
const deptLoading = ref(false);
const transferOpen = ref(false);
const transferConfirmed = ref(false);
const transferTargetId = ref<number>();
const transferSource = ref<SystemDeptApi.DeleteImpact>();
const transferSubmitting = ref(false);
const allUserCount = ref(0);
const currentUserCount = ref(0);

const [UserDrawer, userDrawerApi] = useVbenDrawer({
  connectedComponent: UserForm,
  destroyOnClose: true,
});

const [DeptModal, deptModalApi] = useVbenModal({
  connectedComponent: DeptForm,
  destroyOnClose: true,
});

const selectedDeptId = computed(() => {
  const key = selectedKeys.value[0];
  return key && key !== 'all' ? Number(key) : undefined;
});

const flatDepartments = computed(() => flattenDepartments(departments.value));
const selectedDept = computed(() =>
  flatDepartments.value.find((item) => item.id === selectedDeptId.value),
);

const treeData = computed<DeptTreeNode[]>(() => {
  const keyword = departmentSearch.value.trim().toLowerCase();
  const children = toTreeNodes(departments.value, keyword);
  return [
    {
      children,
      key: 'all',
      title: `${$t('system.user.allUsers')} (${allUserCount.value})`,
    },
  ];
});

const transferDeptOptions = computed(() =>
  toSelectNodes(departments.value, transferSource.value?.id),
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
    columns: useColumns(onActionClick, onStatusChange, getDeptName),
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
          if (selectedDeptId.value === undefined) {
            allUserCount.value = response.total ?? 0;
          }
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

function getDeptName(deptId?: number) {
  return flatDepartments.value.find((item) => item.id === deptId)?.name ?? '';
}

function toTreeNodes(
  items: SystemDeptApi.SystemDept[],
  keyword = '',
): DeptTreeNode[] {
  return items.flatMap((item) => {
    const children = toTreeNodes(item.children ?? [], keyword);
    if (keyword && !item.name.toLowerCase().includes(keyword) && !children.length) {
      return [];
    }
    return [
      {
        children,
        key: String(item.id),
        raw: item,
        title: `${item.name} (${item.totalUserCount ?? 0})`,
      },
    ];
  });
}

function toSelectNodes(
  items: SystemDeptApi.SystemDept[],
  excludedId?: number,
): Array<Record<string, any>> {
  return items.flatMap((item) => {
    if (item.id === excludedId) return [];
    return [
      {
        children: toSelectNodes(item.children ?? [], excludedId),
        label: item.name,
        value: item.id,
      },
    ];
  });
}

async function loadDepartments() {
  deptLoading.value = true;
  try {
    const response = await getDeptList();
    departments.value = response.items ?? [];
  } finally {
    deptLoading.value = false;
  }
}

async function refreshAll() {
  await Promise.all([loadDepartments(), gridApi.query()]);
}

function onDepartmentSelect(keys: Array<number | string>) {
  selectedKeys.value = [String(keys[0] ?? 'all')];
  gridApi.query();
}

function onIncludeChildrenChange() {
  gridApi.query();
}

function createRootDept() {
  deptModalApi.setData(null).open();
}

function createChildDept() {
  if (!selectedDept.value) return;
  deptModalApi.setData({ parentId: selectedDept.value.id }).open();
}

function editSelectedDept() {
  if (!selectedDept.value) return;
  deptModalApi.setData({ ...selectedDept.value }).open();
}

async function deleteSelectedDept() {
  if (!selectedDept.value) return;
  const impact = await getDeptDeleteImpact(selectedDept.value.id);
  if (impact.isProtectedRoot) {
    message.warning($t('system.user.rootDeptProtected'));
    return;
  }
  if (impact.hasChildren) {
    message.warning($t('system.user.deptHasChildren'));
    return;
  }
  if (impact.hasDataScopeRoles) {
    message.warning($t('system.user.deptHasDataScopeRoles'));
    return;
  }
  if (impact.requiresUserTransfer) {
    transferSource.value = impact;
    transferTargetId.value = undefined;
    transferConfirmed.value = false;
    transferOpen.value = true;
    return;
  }
  Modal.confirm({
    content: $t('system.user.deleteEmptyDeptConfirm', [impact.name]),
    okButtonProps: { danger: true },
    okText: $t('common.confirm'),
    async onOk() {
      await deleteDept(impact.id);
      selectedKeys.value = ['all'];
      await refreshAll();
      message.success($t('system.user.deptDeleteSuccess'));
    },
    title: $t('system.user.deleteDeptTitle'),
  });
}

async function confirmTransferAndDelete() {
  if (!transferSource.value || !transferTargetId.value || !transferConfirmed.value) {
    return;
  }
  transferSubmitting.value = true;
  try {
    const result = await transferAndDeleteDept(
      transferSource.value.id,
      transferTargetId.value,
    );
    selectedKeys.value = [String(transferTargetId.value)];
    transferOpen.value = false;
    await refreshAll();
    message.success(
      $t('system.user.transferDeleteSuccess', [result.transferredUserCount]),
    );
  } finally {
    transferSubmitting.value = false;
  }
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemUserApi.SystemUser>) {
  if (code === 'edit') userDrawerApi.setData(row).open();
  if (code === 'delete') onDeleteUser(row);
}

async function onStatusChange(
  newStatus: string,
  row: SystemUserApi.SystemUser,
) {
  const status = ApiType.StatusOptions().find((item) => item.value === newStatus);
  return new Promise<boolean>((resolve) => {
    Modal.confirm({
      content: $t('system.user.statusChangeConfirm', [row.name, status?.label]),
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
  userDrawerApi
    .setData(selectedDeptId.value ? { deptId: selectedDeptId.value } : null)
    .open();
}

onMounted(loadDepartments);
</script>

<template>
  <Page auto-content-height>
    <UserDrawer @success="refreshAll" />
    <DeptModal @success="refreshAll" />

    <div class="org-workbench">
      <Card class="dept-panel" :bordered="false" :loading="deptLoading">
        <div class="dept-panel__header">
          <div>
            <div class="dept-panel__title">{{ $t('system.user.departments') }}</div>
            <div class="dept-panel__subtitle">{{ $t('system.user.departmentsHint') }}</div>
          </div>
          <Button type="primary" size="small" @click="createRootDept">
            <Plus class="size-4" />
            {{ $t('system.user.addDept') }}
          </Button>
        </div>

        <Input
          v-model:value="departmentSearch"
          allow-clear
          :placeholder="$t('system.user.searchDept')"
        >
          <template #prefix><Search class="size-4 text-gray-400" /></template>
        </Input>

        <div class="dept-tree-wrap">
          <Tree
            v-if="treeData.length"
            block-node
            default-expand-all
            :selected-keys="selectedKeys"
            :tree-data="treeData"
            @select="onDepartmentSelect"
          />
          <Empty v-else :description="$t('system.user.noDepartments')" />
        </div>

        <div v-if="selectedDept" class="dept-actions">
          <div class="dept-actions__name">
            <span>{{ selectedDept.name }}</span>
            <Tag color="blue">{{ selectedDept.totalUserCount ?? 0 }}</Tag>
          </div>
          <Space wrap>
            <Button size="small" @click="createChildDept">
              {{ $t('system.user.addChildDept') }}
            </Button>
            <Button size="small" @click="editSelectedDept">
              {{ $t('common.edit') }}
            </Button>
            <Button danger size="small" @click="deleteSelectedDept">
              {{ $t('common.delete') }}
            </Button>
          </Space>
        </div>
      </Card>

      <div class="user-panel">
        <div class="user-context-card">
          <div>
            <span class="user-context__title">{{ currentContextTitle }}</span>
            <span class="user-context__count">
              {{
                $t('system.user.peopleCount', [
                  currentUserCount,
                ])
              }}
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

    <Modal
      v-model:open="transferOpen"
      :confirm-loading="transferSubmitting"
      :ok-button-props="{
        danger: true,
        disabled: !transferTargetId || !transferConfirmed,
      }"
      :ok-text="$t('system.user.transferAndDelete')"
      :title="$t('system.user.transferDeleteTitle', [transferSource?.name ?? ''])"
      width="560px"
      @ok="confirmTransferAndDelete"
    >
      <div class="transfer-dialog">
        <div class="transfer-warning">
          {{
            $t('system.user.transferDeleteWarning', [
              transferSource?.name ?? '',
              transferSource?.directUserCount ?? 0,
            ])
          }}
        </div>
        <div>
          <div class="field-label">{{ $t('system.user.targetDept') }}</div>
          <TreeSelect
            v-model:value="transferTargetId"
            class="w-full"
            :dropdown-style="{ maxHeight: '320px', overflow: 'auto' }"
            :placeholder="$t('system.user.targetDeptPlaceholder')"
            :tree-data="transferDeptOptions"
            tree-default-expand-all
          />
        </div>
        <Checkbox v-model:checked="transferConfirmed">
          {{ $t('system.user.transferDeleteAcknowledge') }}
        </Checkbox>
      </div>
    </Modal>
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

.dept-panel {
  height: 100%;
  overflow: hidden;
}

.dept-panel :deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 18px;
}

.dept-panel__header,
.user-context,
.dept-actions__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dept-panel__title,
.user-context__title {
  font-size: 16px;
  font-weight: 600;
}

.dept-panel__subtitle,
.user-context__count {
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.dept-tree-wrap {
  flex: 1;
  min-height: 180px;
  overflow: auto;
}

.dept-tree-wrap :deep(.ant-tree-node-selected) {
  font-weight: 600;
}

.dept-actions {
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 0.35);
}

.dept-actions__name {
  margin-bottom: 10px;
  font-weight: 600;
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

.user-context__count {
  margin-left: 10px;
}

.include-children {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 400;
}

.transfer-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;
}

.transfer-warning {
  padding: 14px 16px;
  color: #ad4e00;
  border: 1px solid #ffd591;
  border-radius: 10px;
  background: #fff7e6;
}

.field-label {
  margin-bottom: 8px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .org-workbench {
    grid-template-columns: 1fr;
    height: auto;
  }

  .dept-panel {
    max-height: 380px;
  }
}
</style>
