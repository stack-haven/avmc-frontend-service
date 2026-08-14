<script lang="ts" setup>
import type { SystemRoleApi } from '#/api/system/role';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createRole, updateRole } from '#/api/system/role';
import { $t } from '#/locales';

import { useFormSchema } from '../data';
import DeptScopeModal from './dept-scope-modal.vue';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const deptScopeOpen = ref(false);
const deptScopeIds = ref<number[]>([]);

const id = ref();

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = (await formApi.getValues()) as Record<string, any>;
    // 仅当数据范围为自定义部门时提交部门 ID，其余范围清空
    values.deptIds = values.dataScope === 5 ? deptScopeIds.value : [];
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
        deptScopeIds.value = data.deptIds ?? [];
        formApi.setValues({ ...data, menuIds: undefined, deptIds: undefined });
      } else {
        formData.value = undefined;
        id.value = undefined;
        deptScopeIds.value = [];
      }
    }
  },
});

function openDeptScope() {
  deptScopeOpen.value = true;
}

function onDeptScopeConfirm(deptIds: number[]) {
  deptScopeIds.value = deptIds;
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
        <div class="dept-scope-entry">
          <Button @click="openDeptScope">
            {{ $t('system.role.selectDepartments') }}
          </Button>
          <Tag v-if="deptScopeIds.length" color="blue">
            {{ $t('system.role.departmentsSelected', [deptScopeIds.length]) }}
          </Tag>
          <span v-else class="text-muted-foreground text-xs">
            {{ $t('system.role.noDepartmentsSelected') }}
          </span>
          <div v-if="slotProps" class="hidden" />
        </div>
      </template>
    </Form>

    <DeptScopeModal
      v-model:open="deptScopeOpen"
      :selected-dept-ids="deptScopeIds"
      @confirm="onDeptScopeConfirm"
    />
  </Drawer>
</template>

<style scoped>
.dept-scope-entry {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
