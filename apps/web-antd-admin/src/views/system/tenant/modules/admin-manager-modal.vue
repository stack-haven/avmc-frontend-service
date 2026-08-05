<script lang="ts" setup>
import type { SystemTenantApi } from '#/api/system/tenant';

import { computed, reactive, ref, watch } from 'vue';

import {
  Alert,
  Button,
  Empty,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Spin,
  Tag,
} from 'ant-design-vue';

import {
  getTenantAdmins,
  resetTenantAdminPassword,
  updateTenantAdmin,
} from '#/api/system/tenant';
import { $t } from '#/locales';

const props = defineProps<{
  open: boolean;
  tenant?: SystemTenantApi.SystemTenant;
}>();

const emits = defineEmits<{
  'update:open': [value: boolean];
}>();

const admins = ref<SystemTenantApi.TenantAdmin[]>([]);
const loading = ref(false);
const saving = ref(false);
const editOpen = ref(false);
const passwordOpen = ref(false);
const activeAdmin = ref<SystemTenantApi.TenantAdmin>();
const editValues = reactive({ email: '', phone: '', realname: '' });
const passwordValues = reactive({ confirmPassword: '', newPassword: '' });

const passwordStrong = computed(() =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,72}$/.test(
    passwordValues.newPassword,
  ),
);
const passwordMatches = computed(
  () =>
    passwordValues.newPassword.length > 0 &&
    passwordValues.newPassword === passwordValues.confirmPassword,
);

watch(
  () => props.open,
  (open) => {
    if (open) void loadAdmins();
  },
);

function close() {
  emits('update:open', false);
}

async function loadAdmins() {
  if (!props.tenant) return;
  loading.value = true;
  try {
    const response = await getTenantAdmins(props.tenant.id);
    admins.value = response.items ?? [];
  } finally {
    loading.value = false;
  }
}

function openEdit(admin: SystemTenantApi.TenantAdmin) {
  activeAdmin.value = admin;
  editValues.realname = admin.realname ?? '';
  editValues.email = admin.email ?? '';
  editValues.phone = admin.phone ?? '';
  editOpen.value = true;
}

async function saveProfile() {
  if (!props.tenant || !activeAdmin.value) return;
  saving.value = true;
  try {
    await updateTenantAdmin(props.tenant.id, activeAdmin.value.id, {
      email: editValues.email,
      phone: editValues.phone,
      realname: editValues.realname,
    });
    message.success($t('system.tenant.adminProfileSaved'));
    editOpen.value = false;
    await loadAdmins();
  } finally {
    saving.value = false;
  }
}

function openPasswordReset(admin: SystemTenantApi.TenantAdmin) {
  activeAdmin.value = admin;
  passwordValues.newPassword = '';
  passwordValues.confirmPassword = '';
  passwordOpen.value = true;
}

function confirmPasswordReset() {
  if (!props.tenant || !activeAdmin.value || !passwordStrong.value || !passwordMatches.value) {
    return;
  }
  Modal.confirm({
    title: $t('system.tenant.adminPasswordConfirmTitle'),
    content: $t('system.tenant.adminPasswordConfirmContent', [activeAdmin.value.name]),
    okType: 'danger',
    async onOk() {
      if (!props.tenant || !activeAdmin.value) return;
      saving.value = true;
      try {
        await resetTenantAdminPassword(
          props.tenant.id,
          activeAdmin.value.id,
          passwordValues.newPassword,
        );
        message.success($t('system.tenant.adminPasswordResetSuccess'));
        passwordOpen.value = false;
      } finally {
        saving.value = false;
      }
    },
  });
}
</script>

<template>
  <Modal
    :footer="null"
    :open="open"
    :title="$t('system.tenant.adminManagerTitle')"
    width="min(820px, calc(100vw - 32px))"
    @cancel="close"
  >
    <div class="space-y-4">
      <div class="rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-base font-semibold">{{ tenant?.name }}</span>
          <Tag>{{ tenant?.code }}</Tag>
        </div>
        <p class="text-muted-foreground mb-0 mt-1 text-sm">
          {{ $t('system.tenant.adminManagerHint') }}
        </p>
      </div>

      <Spin :spinning="loading">
        <div v-if="admins.length" class="space-y-3">
          <article
            v-for="admin in admins"
            :key="admin.id"
            class="rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-sm"
          >
            <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <strong class="truncate text-base">{{ admin.name }}</strong>
                  <Tag color="blue">{{ $t('system.tenant.adminRole') }}</Tag>
                  <Tag color="green">{{ $t('system.tenant.adminEnabled') }}</Tag>
                </div>
                <div class="text-muted-foreground mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  <span>{{ admin.realname || $t('system.tenant.adminNotSet') }}</span>
                  <span>{{ admin.email || $t('system.tenant.adminNotSet') }}</span>
                  <span>{{ admin.phone || $t('system.tenant.adminNotSet') }}</span>
                </div>
              </div>
              <div class="flex shrink-0 flex-wrap gap-2">
                <Button @click="openEdit(admin)">
                  {{ $t('system.tenant.adminEditProfile') }}
                </Button>
                <Button danger @click="openPasswordReset(admin)">
                  {{ $t('system.tenant.adminResetPassword') }}
                </Button>
              </div>
            </div>
          </article>
        </div>
        <Empty v-else-if="!loading" :description="$t('system.tenant.adminEmpty')" />
      </Spin>
    </div>
  </Modal>

  <Modal
    v-model:open="editOpen"
    :confirm-loading="saving"
    :title="$t('system.tenant.adminEditTitle')"
    @ok="saveProfile"
  >
    <Alert
      class="mb-4"
      :message="$t('system.tenant.adminIdentityReadonly', [activeAdmin?.name ?? ''])"
      show-icon
      type="info"
    />
    <Form layout="vertical">
      <FormItem :label="$t('system.tenant.adminRealname')">
        <Input v-model:value="editValues.realname" :maxlength="50" />
      </FormItem>
      <FormItem :label="$t('system.tenant.adminEmail')">
        <Input v-model:value="editValues.email" type="email" />
      </FormItem>
      <FormItem :label="$t('system.tenant.adminPhone')">
        <Input v-model:value="editValues.phone" :maxlength="20" />
      </FormItem>
    </Form>
  </Modal>

  <Modal
    v-model:open="passwordOpen"
    :confirm-loading="saving"
    :ok-button-props="{ disabled: !passwordStrong || !passwordMatches, danger: true }"
    :title="$t('system.tenant.adminResetPasswordTitle')"
    @ok="confirmPasswordReset"
  >
    <Alert
      class="mb-4"
      :message="$t('system.tenant.adminPasswordImpact', [activeAdmin?.name ?? ''])"
      show-icon
      type="warning"
    />
    <Form layout="vertical">
      <FormItem :label="$t('system.tenant.adminNewPassword')">
        <Input.Password v-model:value="passwordValues.newPassword" autocomplete="new-password" />
        <div :class="passwordStrong ? 'text-success' : 'text-muted-foreground'" class="mt-1 text-xs">
          {{ $t('system.tenant.adminPasswordRule') }}
        </div>
      </FormItem>
      <FormItem :label="$t('system.tenant.adminConfirmPassword')">
        <Input.Password v-model:value="passwordValues.confirmPassword" autocomplete="new-password" />
        <div v-if="passwordValues.confirmPassword && !passwordMatches" class="text-destructive mt-1 text-xs">
          {{ $t('system.tenant.adminPasswordMismatch') }}
        </div>
      </FormItem>
    </Form>
  </Modal>
</template>
