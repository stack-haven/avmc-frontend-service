<script lang="ts" setup>
import type { Key } from 'ant-design-vue/es/_util/type';
import type { DataNode } from 'ant-design-vue/es/tree';

import type { SystemDeptApi } from '#/api';

import { computed, ref, watch } from 'vue';

import {
  Button,
  Empty,
  Input,
  Modal,
  Space,
  Spin,
  Tree,
} from 'ant-design-vue';

import { getDeptList } from '#/api/system/dept';
import { $t } from '#/locales';

const props = defineProps<{
  open: boolean;
  selectedDeptIds?: number[];
}>();

const emits = defineEmits<{
  confirm: [deptIds: number[]];
  'update:open': [value: boolean];
}>();

const checkedKeys = ref<Key[]>([]);
const expandedKeys = ref<Key[]>([]);
const loading = ref(false);
const searchKeyword = ref('');
const treeData = ref<DataNode[]>([]);

const allKeys = computed(() => collectKeys(treeData.value));
const filteredTreeData = computed(() =>
  filterTree(treeData.value, searchKeyword.value.trim().toLowerCase()),
);

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    checkedKeys.value = (props.selectedDeptIds ?? []).map(Number);
    searchKeyword.value = '';
    if (treeData.value.length === 0) await loadDepts();
    expandedKeys.value = treeData.value.map((node) => node.key);
  },
);

async function loadDepts() {
  loading.value = true;
  try {
    const response = await getDeptList();
    treeData.value = toTreeNodes(response.items ?? []);
  } finally {
    loading.value = false;
  }
}

function toTreeNodes(items: SystemDeptApi.SystemDept[]): DataNode[] {
  return items.map((item) => ({
    children: toTreeNodes(item.children ?? []),
    key: Number(item.id),
    title: item.name,
  }));
}

function collectKeys(nodes: DataNode[]): Key[] {
  return nodes.flatMap((node) => [node.key, ...collectKeys(node.children ?? [])]);
}

function filterTree(nodes: DataNode[], keyword: string): DataNode[] {
  if (!keyword) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], keyword);
    const matched = String(node.title ?? '').toLowerCase().includes(keyword);
    return matched || children.length > 0 ? [{ ...node, children }] : [];
  });
}

function close() {
  emits('update:open', false);
}

function confirm() {
  emits('confirm', checkedKeys.value.map(Number));
  close();
}
</script>

<template>
  <Modal
    :open="open"
    :title="$t('system.role.customDepartments')"
    width="min(760px, calc(100vw - 32px))"
    @cancel="close"
    @ok="confirm"
  >
    <div class="dept-scope-shell">
      <div class="dept-scope-summary">
        <p class="text-muted-foreground text-sm">
          {{ $t('system.role.deptScopeHint') }}
        </p>
        <div class="selected-count">
          <strong>{{ checkedKeys.length }}</strong>
          <span>{{ $t('system.role.selectedDepartments') }}</span>
        </div>
      </div>

      <div class="dept-scope-toolbar">
        <Input.Search
          v-model:value="searchKeyword"
          allow-clear
          :placeholder="$t('system.role.searchDepartments')"
          class="max-w-sm"
        />
        <Space wrap>
          <Button size="small" @click="expandedKeys = allKeys">
            {{ $t('system.role.expandAll') }}
          </Button>
          <Button size="small" @click="expandedKeys = []">
            {{ $t('system.role.collapseAll') }}
          </Button>
          <Button size="small" @click="checkedKeys = allKeys">
            {{ $t('system.role.selectAll') }}
          </Button>
          <Button danger size="small" @click="checkedKeys = []">
            {{ $t('system.role.clearAll') }}
          </Button>
        </Space>
      </div>

      <Spin :spinning="loading">
        <div class="dept-tree-panel">
          <Tree
            v-if="filteredTreeData.length > 0"
            v-model:checked-keys="checkedKeys"
            v-model:expanded-keys="expandedKeys"
            block-node
            checkable
            :height="360"
            :tree-data="filteredTreeData"
            virtual
          />
          <Empty v-else :description="$t('system.role.noDepartmentsFound')" />
        </div>
      </Spin>
    </div>
  </Modal>
</template>

<style scoped>
.dept-scope-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dept-scope-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 16px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 35%);
}

.selected-count {
  display: flex;
  min-width: 96px;
  flex-direction: column;
  align-items: flex-end;
}

.selected-count strong {
  color: hsl(var(--primary));
  font-size: 22px;
  line-height: 1;
}

.selected-count span {
  margin-top: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.dept-scope-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dept-tree-panel {
  min-height: 360px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
}

@media (max-width: 720px) {
  .dept-scope-summary,
  .dept-scope-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .selected-count {
    align-items: flex-start;
  }
}
</style>
