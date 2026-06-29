<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemMenuPermissionGroupApi } from '#/api/system/menu-permission-group';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { ApiType } from '#/api';
import {
  deleteMenuPermissionGroup,
  getMenuPermissionGroupList,
  updateMenuPermissionGroupStatus,
} from '#/api/system/menu-permission-group';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    proxyConfig: {
      ajax: {
        query: async ({ page }, formValues) => {
          return await getMenuPermissionGroupList({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
        },
      },
      response: {
        list: 'items',
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<SystemMenuPermissionGroupApi.MenuPermissionGroup>,
});

function onActionClick(
  e: OnActionClickParams<SystemMenuPermissionGroupApi.MenuPermissionGroup>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function confirm(content: string, title: string) {
  return new Promise((resolve, reject) => {
    Modal.confirm({
      content,
      onCancel() {
        reject(new Error('cancelled'));
      },
      onOk() {
        resolve(true);
      },
      title,
    });
  });
}

async function onStatusChange(
  newStatus: string,
  row: SystemMenuPermissionGroupApi.MenuPermissionGroup,
) {
  const status = ApiType.StatusOptions().find(
    (item) => item.value === newStatus,
  );
  try {
    await confirm(
      $t('system.menuPermissionGroup.statusChangeConfirm', [
        row.name,
        status?.label,
      ]),
      $t('system.menuPermissionGroup.statusChangeTitle'),
    );
    await updateMenuPermissionGroupStatus(row.id, { status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onEdit(row: SystemMenuPermissionGroupApi.MenuPermissionGroup) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemMenuPermissionGroupApi.MenuPermissionGroup) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteMenuPermissionGroup(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.menuPermissionGroup.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [
              $t('system.menuPermissionGroup.name'),
            ])
          }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
