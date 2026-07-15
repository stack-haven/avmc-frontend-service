<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cancelAsyncTask,
  getAsyncTaskList,
  getAsyncTaskStats,
  retryAsyncTask,
} from '#/api';
import type { SystemAsyncTaskApi } from '#/api';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';

const stats = ref<SystemAsyncTaskApi.AsyncTaskStats>();
const statsLoading = ref(false);

const healthColorMap: Record<SystemAsyncTaskApi.TaskHealthStatus, string> = {
  ASYNC_TASK_HEALTH_STATUS_CRITICAL: 'error',
  ASYNC_TASK_HEALTH_STATUS_HEALTHY: 'success',
  ASYNC_TASK_HEALTH_STATUS_UNSPECIFIED: 'default',
  ASYNC_TASK_HEALTH_STATUS_WARNING: 'warning',
};

function healthLabel(status?: SystemAsyncTaskApi.TaskHealthStatus) {
  if (status === 'ASYNC_TASK_HEALTH_STATUS_CRITICAL') {
    return $t('system.asyncTask.healthCritical');
  }
  if (status === 'ASYNC_TASK_HEALTH_STATUS_WARNING') {
    return $t('system.asyncTask.healthWarning');
  }
  if (status === 'ASYNC_TASK_HEALTH_STATUS_HEALTHY') {
    return $t('system.asyncTask.healthHealthy');
  }
  return $t('system.asyncTask.healthUnknown');
}

function alertLabel(alert: SystemAsyncTaskApi.AsyncTaskHealthAlert) {
  return $t(`system.asyncTask.alerts.${alert.code}`, [alert.count]);
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) =>
          getAsyncTaskList({
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          }),
      },
      response: { list: 'items' },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as any,
});

async function loadStats() {
  statsLoading.value = true;
  try {
    const resp = await getAsyncTaskStats({ pendingOverdueSeconds: 300 });
    stats.value = resp.stats;
  } finally {
    statsLoading.value = false;
  }
}

function onAction({ code, row }: any) {
  if (code === 'cancel') {
    Modal.confirm({
      content: $t('system.asyncTask.cancelConfirm', [row.id]),
      title: $t('system.asyncTask.cancel'),
      async onOk() {
        await cancelAsyncTask(row.id);
        message.success($t('system.asyncTask.cancelSuccess'));
        gridApi.query();
        loadStats();
      },
    });
  }
  if (code === 'retry') {
    Modal.confirm({
      content: $t('system.asyncTask.retryConfirm', [row.id]),
      title: $t('system.asyncTask.retry'),
      async onOk() {
        await retryAsyncTask(row.id);
        message.success($t('system.asyncTask.retrySuccess'));
        gridApi.query();
        loadStats();
      },
    });
  }
}

onMounted(loadStats);
</script>

<template>
  <Page auto-content-height>
    <div class="mb-4 rounded-md border border-border bg-background px-4 py-3">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="text-base font-medium">
            {{ $t('system.asyncTask.health') }}
          </span>
          <a-tag
            :color="
              healthColorMap[
                stats?.healthStatus ??
                  'ASYNC_TASK_HEALTH_STATUS_UNSPECIFIED'
              ]
            "
          >
            {{ healthLabel(stats?.healthStatus) }}
          </a-tag>
        </div>
        <a-button :loading="statsLoading" size="small" @click="loadStats">
          {{ $t('system.asyncTask.refreshStats') }}
        </a-button>
      </div>
      <div v-if="stats?.alerts?.length" class="mb-3 flex flex-wrap gap-2">
        <a-tag
          v-for="alert in stats.alerts"
          :key="alert.code"
          :color="healthColorMap[alert.status]"
        >
          {{ alertLabel(alert) }}
        </a-tag>
      </div>
      <div class="grid gap-3 md:grid-cols-5">
        <a-statistic
          :loading="statsLoading"
          :title="$t('system.asyncTask.total')"
          :value="stats?.total ?? 0"
        />
        <a-statistic
          :loading="statsLoading"
          :title="$t('system.asyncTask.pendingOverdue')"
          :value="stats?.pendingOverdue ?? 0"
        />
        <a-statistic
          :loading="statsLoading"
          :title="$t('system.asyncTask.runningLeaseExpired')"
          :value="stats?.runningLeaseExpired ?? 0"
        />
        <a-statistic
          :loading="statsLoading"
          :title="$t('system.asyncTask.failedCount')"
          :value="stats?.failed ?? 0"
        />
        <a-statistic
          :loading="statsLoading"
          :title="$t('system.asyncTask.retryPressure')"
          :value="stats?.retryPressure ?? 0"
        />
      </div>
    </div>
    <Grid :table-title="$t('system.asyncTask.list')" />
  </Page>
</template>
