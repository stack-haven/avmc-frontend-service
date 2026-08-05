<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemDeptApi, SystemUserApi } from '#/api';

import { computed, reactive, ref } from 'vue';

import { useVbenDrawer, VbenTree } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { message, Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createUser, getDeptList, getRoleList, getUser, updateUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();
const roleOptions = reactive<Array<{ label: string; value: number }>>([]);
const deptOptions = reactive<Array<{ label: string; value: number }>>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(roleOptions, deptOptions),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    if (!id.value && !values.password) {
      message.error($t('system.user.passwordRequired'));
      return;
    }
    if (id.value && !values.password) {
      delete values.password;
    }
    drawerApi.lock();
    (id.value
      ? updateUser(id.value, values)
      : createUser(
          values as Omit<
            SystemUserApi.SystemUser,
            'id' | 'isTenantAdmin'
          >,
        ))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      formApi.resetForm();
      const roles = await getRoleList({ pageSize: 100 });
      roleOptions.splice(
        0,
        roleOptions.length,
        ...(roles.items ?? []).map((role) => ({
          label: role.isTenantAdmin
            ? `${role.name} (${$t('system.user.tenantAdmin')})`
            : role.name,
          value: role.id,
        })),
      );
      const departments = await getDeptList();
      deptOptions.splice(
        0,
        deptOptions.length,
        ...flattenDepartments(departments.items ?? []),
      );
      if (data) {
        id.value = data.id;
        const detail = await getUser(data.id);
        formData.value = detail;
        formApi.setValues({ ...detail, password: undefined });
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
    }
  },
});

function flattenDepartments(
  items: SystemDeptApi.SystemDept[],
  prefix = '',
): Array<{ label: string; value: number }> {
  return items.flatMap((item) => [
    { label: `${prefix}${item.name}`, value: item.id },
    ...flattenDepartments(item.children ?? [], `${prefix}  `),
  ]);
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
    if (node.index % 3 >= 1) {
      classes.push('!pl-0');
    }
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <VbenTree
            :tree-data="permissions"
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
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </VbenTree>
        </Spin>
      </template>
    </Form>
  </Drawer>
</template>
<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
