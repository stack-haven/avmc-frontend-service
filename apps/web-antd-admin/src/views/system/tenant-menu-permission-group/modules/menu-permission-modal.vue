<script lang="ts" setup>
import type { Key } from 'ant-design-vue/es/_util/type';
import type { DataNode } from 'ant-design-vue/es/tree';

import type { ApiType, SystemMenuApi } from '#/api';
import type { SystemTenantTenantMenuPermissionGroupApi } from '#/api/system/tenant-menu-permission-group';

import { computed, ref, watch } from 'vue';

import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Empty,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Tree,
} from 'ant-design-vue';

import { getMenuList } from '#/api/system/menu';
import { updateTenantMenuPermissionGroup } from '#/api/system/tenant-menu-permission-group';
import { $t } from '#/locales';

const props = defineProps<{
  group?: SystemTenantTenantMenuPermissionGroupApi.TenantMenuPermissionGroup;
  open: boolean;
}>();

const emits = defineEmits<{
  success: [];
  'update:open': [value: boolean];
}>();

const checkedKeys = ref<Key[]>([]);
const expandedKeys = ref<Key[]>([]);
const loading = ref(false);
const saving = ref(false);
const searchKeyword = ref('');
const treeData = ref<DataNode[]>([]);

const allKeys = computed(() => collectKeys(treeData.value));
const filteredTreeData = computed(() =>
  filterTree(treeData.value, searchKeyword.value.trim().toLocaleLowerCase()),
);

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    checkedKeys.value = (props.group?.menuIds ?? []).map(Number);
    searchKeyword.value = '';
    if (treeData.value.length === 0) await loadMenus();
    expandedKeys.value = treeData.value.map((node) => node.key);
  },
);

async function loadMenus() {
  loading.value = true;
  try {
    const response = (await getMenuList()) as ApiType.ListResponse<SystemMenuApi.SystemMenu>;
    treeData.value = toTreeNodes(response.items ?? []);
  } finally {
    loading.value = false;
  }
}

function toTreeNodes(items: SystemMenuApi.SystemMenu[]): DataNode[] {
  return items.map((item) => ({
    children: toTreeNodes(item.children ?? []),
    icon: item.meta?.icon,
    key: Number(item.id),
    title: $t(item.meta?.title ?? item.name),
  }));
}

function collectKeys(nodes: DataNode[]): Key[] {
  return nodes.flatMap((node) => [node.key, ...collectKeys(node.children ?? [])]);
}

function filterTree(nodes: DataNode[], keyword: string): DataNode[] {
  if (!keyword) return nodes;
  return nodes.flatMap((node) => {
    const children = filterTree(node.children ?? [], keyword);
    const matched = String(node.title ?? '').toLocaleLowerCase().includes(keyword);
    return matched || children.length > 0 ? [{ ...node, children }] : [];
  });
}

function close() {
  emits('update:open', false);
}

async function save() {
  const group = props.group;
  if (!group) return;
  saving.value = true;
  try {
    await updateTenantMenuPermissionGroup(group.id, {
      apiPermissions: group.apiPermissions ?? [],
      code: group.code,
      description: group.description,
      featureFlags: group.featureFlags ?? {},
      isSystem: group.isSystem,
      menuIds: checkedKeys.value.map(Number),
      name: group.name,
      remark: group.remark,
      resourceQuotas: group.resourceQuotas ?? {},
      sort: group.sort,
      status: group.status,
    });
    message.success($t('system.tenantMenuPermissionGroup.menuSaveSuccess'));
    emits('success');
    close();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Modal
    :confirm-loading="saving"
    :open="open"
    :title="$t('system.tenantMenuPermissionGroup.menuPermissionTitle')"
    width="min(1080px, calc(100vw - 32px))"
    @cancel="close"
    @ok="save"
  >
    <div class="menu-permission-shell">
      <div class="menu-permission-summary">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="truncate text-base font-semibold">{{ group?.name }}</span>
            <Tag>{{ group?.code }}</Tag>
          </div>
          <p class="text-muted-foreground mt-1 text-sm">
            {{ $t('system.tenantMenuPermissionGroup.menuPermissionHint') }}
          </p>
        </div>
        <div class="selected-count">
          <strong>{{ checkedKeys.length }}</strong>
          <span>{{ $t('system.tenantMenuPermissionGroup.selectedMenus') }}</span>
        </div>
      </div>

      <div class="menu-permission-toolbar">
        <Input.Search
          v-model:value="searchKeyword"
          allow-clear
          :placeholder="$t('system.tenantMenuPermissionGroup.searchMenus')"
          class="max-w-sm"
        />
        <Space wrap>
          <Button size="small" @click="expandedKeys = allKeys">
            {{ $t('system.tenantMenuPermissionGroup.expandAll') }}
          </Button>
          <Button size="small" @click="expandedKeys = []">
            {{ $t('system.tenantMenuPermissionGroup.collapseAll') }}
          </Button>
          <Button size="small" @click="checkedKeys = allKeys">
            {{ $t('system.tenantMenuPermissionGroup.selectAll') }}
          </Button>
          <Button danger size="small" @click="checkedKeys = []">
            {{ $t('system.tenantMenuPermissionGroup.clearAll') }}
          </Button>
        </Space>
      </div>

      <Spin :spinning="loading">
        <div class="menu-tree-panel">
          <Tree
            v-if="filteredTreeData.length > 0"
            v-model:checked-keys="checkedKeys"
            v-model:expanded-keys="expandedKeys"
            block-node
            checkable
            :height="430"
            :tree-data="filteredTreeData"
            virtual
          >
            <template #title="node">
              <span class="inline-flex items-center gap-2 py-0.5">
                <IconifyIcon v-if="node.icon" :icon="node.icon" class="text-muted-foreground" />
                <span>{{ node.title }}</span>
              </span>
            </template>
          </Tree>
          <Empty v-else :description="$t('system.tenantMenuPermissionGroup.noMenusFound')" />
        </div>
      </Spin>

      <div class="menu-permission-impact">
        {{ $t('system.tenantMenuPermissionGroup.menuChangeImpact') }}
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.menu-permission-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.menu-permission-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 18px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--muted) / 35%);
}

.selected-count {
  display: flex;
  min-width: 108px;
  flex-direction: column;
  align-items: flex-end;
}

.selected-count strong {
  color: hsl(var(--primary));
  font-size: 24px;
  line-height: 1;
}

.selected-count span {
  margin-top: 6px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.menu-permission-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.menu-tree-panel {
  min-height: 430px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  background: hsl(var(--background));
}

.menu-permission-impact {
  padding: 10px 12px;
  border-left: 3px solid hsl(var(--primary));
  border-radius: 4px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--primary) / 6%);
  font-size: 12px;
}

@media (max-width: 720px) {
  .menu-permission-summary,
  .menu-permission-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .selected-count {
    align-items: flex-start;
  }
}
</style>
