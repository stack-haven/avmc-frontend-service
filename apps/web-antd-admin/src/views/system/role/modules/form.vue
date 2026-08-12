<script lang="ts" setup>
import type { SystemDeptApi } from '#/api';
import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer, VbenTree } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptList } from '#/api/system/dept';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();
const deptTree = ref<SystemDeptApi.SystemDept[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as Record<string, any>;
    values.deptIds = (values.deptIds ?? []).map(Number);
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();
      if (data) {
        formData.value = data;
        id.value = data.id;
        formApi.setValues({ ...data, menuIds: undefined });
      } else {
        formData.value = undefined;
        id.value = undefined;
      }
      if (deptTree.value.length === 0) {
        loadDepartments();
      }
    }
  },
});

async function loadDepartments() {
  const departments = await getDeptList();
  deptTree.value = departments.items ?? [];
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', [$t('system.role.name')])
    : $t('common.create', [$t('system.role.name')]);
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #deptIds="slotProps">
        <VbenTree
          :tree-data="deptTree"
          multiple
          bordered
          :default-expanded-level="2"
          v-bind="slotProps"
          value-field="id"
          label-field="name"
        />
      </template>
    </Form>
  </Drawer>
</template>
