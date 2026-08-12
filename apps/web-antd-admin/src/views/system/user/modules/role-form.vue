<script lang="ts" setup>
import type { SystemUserApi } from '#/api';

import { computed, reactive, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Alert, Checkbox, Empty, Tag } from 'ant-design-vue';

import { getRoleSimpleList, getUser, updateUser } from '#/api';
import { $t } from '#/locales';

const emits = defineEmits(['success']);

const roleOptions = reactive<Array<{ label: string; value: number }>>([]);
const fetching = ref(false);
const selectedRoleIds = ref<number[]>([]);

const id = ref<number>();
const userName = ref('');

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    if (!selectedRoleIds.value.length) return;
    modalApi.lock();
    updateUser(id.value!, { roleIds: selectedRoleIds.value } as any)
      .then(() => { emits('success'); modalApi.close(); })
      .catch(() => modalApi.unlock());
  },
  async onOpenChange(open) {
    if (!open) return;
    const data = modalApi.getData<SystemUserApi.SystemUser>();
    selectedRoleIds.value = [];
    fetching.value = true;

    const roles = await getRoleSimpleList();
    roleOptions.splice(0, roleOptions.length, ...(roles.items ?? []).map((r) => ({
      label: r.isTenantAdmin ? `${r.name} (${$t('system.user.tenantAdmin')})` : r.name,
      value: r.id,
    })));

    if (data?.id) {
      id.value = data.id;
      userName.value = data.name ?? '';
      const detail = await getUser(data.id);
      selectedRoleIds.value = detail.roleIds ?? [];
    }
    fetching.value = false;
  },
});

const selectedRoles = computed(() =>
  roleOptions.filter((role) => selectedRoleIds.value.includes(role.value)),
);
const modalTitle = computed(() => $t('system.user.configureRolesTitle'));
</script>

<template>
  <Modal
    :title="modalTitle"
    :loading="fetching"
    :confirm-disabled="!selectedRoleIds.length"
    centered
    class="w-[min(760px,calc(100vw-32px))]"
    content-class="px-5 pb-4 pt-2"
  >
    <Alert
      class="mb-4"
      type="info"
      show-icon
      :message="$t('system.user.configureRoles')"
      :description="$t('system.user.editRolesHint', [userName])"
    />

    <div class="role-summary">
      <span class="role-summary__label">{{ $t('system.user.selectedRoles') }}</span>
      <div class="role-summary__tags">
        <Tag v-for="role in selectedRoles" :key="role.value" color="blue">
          {{ role.label }}
        </Tag>
        <span v-if="!selectedRoles.length" class="role-summary__empty">
          {{ $t('system.user.noRolesSelected') }}
        </span>
      </div>
    </div>

    <Checkbox.Group v-if="roleOptions.length" v-model:value="selectedRoleIds" class="role-grid">
      <Checkbox
        v-for="role in roleOptions"
        :key="role.value"
        class="role-option"
        :value="role.value"
      >
        <span>{{ role.label }}</span>
      </Checkbox>
    </Checkbox.Group>
    <Empty v-else :description="$t('system.user.noRolesAvailable')" />
  </Modal>
</template>

<style scoped>
.role-summary {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--muted) / 0.35);
}

.role-summary__label {
  flex: 0 0 auto;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.role-summary__tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.role-summary__empty,
.role-option {
  color: hsl(var(--foreground));
}

.role-summary__empty {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.role-option {
  min-height: 44px;
  margin: 0;
  padding: 10px 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--card));
}

@media (max-width: 640px) {
  .role-grid {
    grid-template-columns: 1fr;
  }
}
</style>
