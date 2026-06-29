<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { ApiType, SystemMenuApi } from '#/api';
import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getMenuList } from '#/api/system/menu';
import {
  createMenuPermissionGroup,
  getMenuPermissionGroup,
  updateMenuPermissionGroup,
} from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemMenuPermissionGroupApi.MenuPermissionGroup>();
const id = ref<string>();
const menus = ref<DataNode[]>([]);
const loadingMenus = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as Omit<
      SystemMenuPermissionGroupApi.MenuPermissionGroup,
      'id'
    >;
    values.menuIds = (values.menuIds ?? []).map(Number);
    drawerApi.lock();
    (id.value
      ? updateMenuPermissionGroup(id.value, values)
      : createMenuPermissionGroup(values)
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
      drawerApi.getData<SystemMenuPermissionGroupApi.MenuPermissionGroup>();
    formApi.resetForm();
    if (data?.id) {
      getMenuPermissionGroup(data.id).then((detail) => {
        formData.value = detail;
        formApi.setValues(detail);
      });
      id.value = data.id;
    } else {
      formData.value = undefined;
      id.value = undefined;
      formApi.setValues({ menuIds: [] });
    }
    if (menus.value.length === 0) {
      loadMenus();
    }
  },
});

async function loadMenus() {
  loadingMenus.value = true;
  try {
    const res =
      (await getMenuList()) as ApiType.ListResponse<SystemMenuApi.SystemMenu>;
    menus.value = res.items as unknown as DataNode[];
  } finally {
    loadingMenus.value = false;
  }
}

const drawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.menuPermissionGroup.name'))
    : $t('common.create', $t('system.menuPermissionGroup.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'MENU_TYPE_BUTTON') {
    classes.push('inline-flex');
  }
  return classes.join(' ');
}
</script>

<template>
  <Drawer :title="drawerTitle">
    <Form>
      <template #menuIds="slotProps">
        <Spin :spinning="loadingMenus" wrapper-class-name="w-full">
          <VbenTree
            :tree-data="menus"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta?.icon" :icon="value.meta.icon" />
              {{ $t(value.meta?.title) }}
            </template>
          </VbenTree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
