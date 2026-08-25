<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createProfile, deleteProfile, getPolicyList, getProfileList, updateProfile } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import ProfileForm from './modules/form.vue';

defineOptions({ name: 'EvieProfileList' });

const policyNameMap = ref<Record<number, string>>({});

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: ProfileForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction, policyNameMap.value),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) => {
          const resp = await getProfileList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          });
          return { items: resp.profiles, total: resp.total };
        },
      },
      response: { list: 'items', total: 'total' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

function refresh() {
  gridApi.query();
}

function onSubmit(values: any) {
  if (values.id) {
    updateProfile(values.id, values).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createProfile(values).then(() => {
      message.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  }
}

function onAction({ code, row }: any) {
  if (code === 'edit') {
    drawerApi.setData(row).open();
  }
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.delete'),
      async onOk() {
        await deleteProfile(row.id);
        message.success($t('ui.actionMessage.operationSuccess'));
        refresh();
      },
    });
  }
}

async function loadPolicies() {
  const resp = await getPolicyList({ pageSize: 200 });
  for (const policy of resp.policies) {
    policyNameMap.value[policy.id!] = policy.name;
  }
}

onMounted(loadPolicies);
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.enhancement.profiles')">
      <template #toolbar-tools>
        <Button type="primary" @click="drawerApi.setData({}).open()">
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
