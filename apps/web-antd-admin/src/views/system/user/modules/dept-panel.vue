<script lang="ts" setup>
import type { SystemDeptApi } from '#/api';

import { computed, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
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
  Tag,
  Tree,
  TreeSelect,
} from 'ant-design-vue';

import {
  deleteDept,
  getDeptDeleteImpact,
  transferAndDeleteDept,
} from '#/api';
import { $t } from '#/locales';

import DeptForm from '../../dept/modules/form.vue';

interface DeptTreeNode {
  children?: DeptTreeNode[];
  key: string;
  raw?: SystemDeptApi.SystemDept;
  title: string;
}

const props = defineProps<{
  departments: SystemDeptApi.SystemDept[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', deptId?: number): void;
  (e: 'refresh'): void;
}>();

const [DeptModal, deptModalApi] = useVbenModal({
  connectedComponent: DeptForm,
  destroyOnClose: true,
});

const searchText = ref('');
const selectedKeys = ref<string[]>(['all']);
const transferOpen = ref(false);
const transferConfirmed = ref(false);
const transferTargetId = ref<number>();
const transferSource = ref<SystemDeptApi.DeleteImpact>();
const transferSubmitting = ref(false);

const flatDepartments = computed(() =>
  flattenDepartments(props.departments),
);

const selectedDept = computed(() =>
  flatDepartments.value.find((item) => String(item.id) === selectedKeys.value[0]),
);

const treeData = computed<DeptTreeNode[]>(() => {
  const keyword = searchText.value.trim().toLowerCase();
  const children = toTreeNodes(props.departments, keyword);
  return [
    {
      children,
      key: 'all',
      title: $t('system.user.allUsers'),
    },
  ];
});

const transferDeptOptions = computed(() =>
  toSelectNodes(props.departments, transferSource.value?.id),
);

watch(
  () => props.departments,
  () => {
    if (selectedKeys.value[0] !== 'all') {
      const stillExists = flatDepartments.value.some(
        (d) => String(d.id) === selectedKeys.value[0],
      );
      if (!stillExists) {
        selectedKeys.value = ['all'];
        emit('select', undefined);
        return;
      }
    }
  },
);

function flattenDepartments(
  items: SystemDeptApi.SystemDept[],
): SystemDeptApi.SystemDept[] {
  return items.flatMap((item) => [
    item,
    ...flattenDepartments(item.children ?? []),
  ]);
}

function toTreeNodes(
  items: SystemDeptApi.SystemDept[],
  keyword = '',
): DeptTreeNode[] {
  return items.flatMap((item) => {
    const children = toTreeNodes(item.children ?? [], keyword);
    if (
      keyword &&
      !item.name.toLowerCase().includes(keyword) &&
      !children.length
    ) {
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

function onSelect(keys: Array<number | string>) {
  const key = keys[0];
  selectedKeys.value = key != null ? [String(key)] : ['all'];
  const deptId = key && key !== 'all' ? Number(key) : undefined;
  emit('select', deptId);
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
      emit('select', undefined);
      emit('refresh');
      message.success($t('system.user.deptDeleteSuccess'));
    },
    title: $t('system.user.deleteDeptTitle'),
  });
}

async function confirmTransferAndDelete() {
  if (
    !transferSource.value ||
    !transferTargetId.value ||
    !transferConfirmed.value
  ) {
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
    emit('select', transferTargetId.value);
    emit('refresh');
    message.success(
      $t('system.user.transferDeleteSuccess', [result.transferredUserCount]),
    );
  } finally {
    transferSubmitting.value = false;
  }
}

function onDeptSaved() {
  emit('refresh');
}
</script>

<template>
  <DeptModal @success="onDeptSaved" />

  <Card class="dept-panel-card" :bordered="false" :loading="loading">
    <div class="dept-panel__header">
      <div>
        <div class="dept-panel__title">{{ $t('system.user.departments') }}</div>
        <div class="dept-panel__subtitle">
          {{ $t('system.user.departmentsHint') }}
        </div>
      </div>
      <Button type="primary" size="small" @click="createRootDept">
        <Plus class="size-4" />
        {{ $t('system.user.addDept') }}
      </Button>
    </div>

    <Input
      v-model:value="searchText"
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
        @select="onSelect"
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

  <Modal
    v-model:open="transferOpen"
    :confirm-loading="transferSubmitting"
    :ok-button-props="{
      danger: true,
      disabled: !transferTargetId || !transferConfirmed,
    }"
    :ok-text="$t('system.user.transferAndDelete')"
    :title="
      $t('system.user.transferDeleteTitle', [transferSource?.name ?? ''])
    "
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
</template>

<style scoped>
.dept-panel-card {
  height: 100%;
  overflow: hidden;
}

.dept-panel-card :deep(.ant-card-body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 18px;
}

.dept-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dept-panel__title {
  font-size: 16px;
  font-weight: 600;
}

.dept-panel__subtitle {
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 0.35);
}

.dept-actions__name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
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
</style>
