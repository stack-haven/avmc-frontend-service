<script setup lang="ts">
import { computed, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Modal, Tabs, message } from 'ant-design-vue';

import type { ParameterApi } from '#/api';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteParameterDefinition,
  getCurrentTenantParameters,
  getParameterDefinitionList,
  resetCurrentTenantParameter,
} from '#/api';
import { $t } from '#/locales';

import {
  currentColumns,
  currentSearchSchema,
  definitionColumns,
  definitionSearchSchema,
} from './data';
import DefinitionForm from './modules/definition-form.vue';
import ValueForm from './modules/value-form.vue';

const { hasAccessByCodes } = useAccess();
const canManageDefinitions = computed(() =>
  hasAccessByCodes([
    '/platform.admin.v1.ParameterService/ListParameterDefinitions',
  ]),
);
const activeTab = ref(
  canManageDefinitions.value ? 'definitions' : 'current',
);

const [DefinitionDrawer, definitionApi] = useVbenDrawer({
  connectedComponent: DefinitionForm,
  destroyOnClose: true,
});
const [ValueDrawer, valueApi] = useVbenDrawer({
  connectedComponent: ValueForm,
  destroyOnClose: true,
});

const [DefinitionGrid, definitionGridApi] = useVbenVxeGrid({
  formOptions: { schema: definitionSearchSchema(), submitOnChange: true },
  gridOptions: {
    columns: definitionColumns(onDefinitionAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) =>
          getParameterDefinitionList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

const [CurrentGrid, currentGridApi] = useVbenVxeGrid({
  formOptions: { schema: currentSearchSchema(), submitOnChange: true },
  gridOptions: {
    columns: currentColumns(onCurrentAction),
    height: 'auto',
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async (_params: any, values: { key?: string }) =>
          getCurrentTenantParameters(values),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'definitionId' },
    toolbarConfig: { custom: true, refresh: true, search: true, zoom: true },
  } as any,
});

function refreshDefinitions() {
  definitionGridApi.query();
  currentGridApi.query();
}

function onDefinitionAction({
  code,
  row,
}: {
  code: string;
  row: ParameterApi.Definition;
}) {
  if (code === 'edit') definitionApi.setData(row).open();
  if (code === 'delete') {
    Modal.confirm({
      content: $t('system.parameter.deleteConfirm', [row.name]),
      title: $t('common.delete'),
      async onOk() {
        await deleteParameterDefinition(row.id);
        message.success($t('common.success'));
        refreshDefinitions();
      },
    });
  }
}

function onCurrentAction({
  code,
  row,
}: {
  code: string;
  row: ParameterApi.Resolved;
}) {
  if (code === 'override') {
    if (!row.tenantOverridable) {
      message.warning($t('system.parameter.notOverridable'));
      return;
    }
    valueApi.setData(row).open();
  }
  if (code === 'reset') {
    if (row.source !== 'PARAMETER_VALUE_SOURCE_TENANT_OVERRIDE') {
      message.info($t('system.parameter.alreadyDefault'));
      return;
    }
    Modal.confirm({
      content: $t('system.parameter.resetConfirm', [row.name]),
      title: $t('system.parameter.reset'),
      async onOk() {
        await resetCurrentTenantParameter(row.key);
        message.success($t('system.parameter.resetSuccess'));
        currentGridApi.query();
      },
    });
  }
}
</script>

<template>
  <Page auto-content-height>
    <DefinitionDrawer @success="refreshDefinitions" />
    <ValueDrawer @success="currentGridApi.query()" />
    <Tabs v-model:active-key="activeTab" destroy-inactive-tab-pane>
      <Tabs.TabPane
        v-if="canManageDefinitions"
        key="definitions"
        :tab="$t('system.parameter.definitions')"
      >
        <DefinitionGrid :table-title="$t('system.parameter.definitions')">
          <template #toolbar-tools>
            <Button type="primary" @click="definitionApi.setData({}).open()">
              <Plus class="size-5" />
              {{ $t('common.create') }}
            </Button>
          </template>
        </DefinitionGrid>
      </Tabs.TabPane>
      <Tabs.TabPane key="current" :tab="$t('system.parameter.currentTenant')">
        <CurrentGrid :table-title="$t('system.parameter.currentTenant')" />
      </Tabs.TabPane>
    </Tabs>
  </Page>
</template>
