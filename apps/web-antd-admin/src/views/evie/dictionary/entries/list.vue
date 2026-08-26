<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, Empty, Modal, Select, message as toast } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { createEntry, deleteEntry, getDictionaryList, getEntryList, updateEntry } from '#/api/evie';
import { $t } from '#/locales';

import { columns, searchSchema } from './data';
import EntryForm from './modules/form.vue';
import { useDictionaryContext } from '#/views/evie/_shared/use-dictionary-context';

defineOptions({ name: 'EvieEntryList' });

// 词库上下文（从 URL ?dictionaryId=N 预选）
const { dictionaryId: urlDictionaryId, setDictionaryId } = useDictionaryContext();

const dictionaryId = ref<number>();
const dictionaryOptions = ref<{ label: string; value: number }[]>([]);

const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: EntryForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: { schema: searchSchema(), submitOnChange: true },
  gridOptions: {
    columns: columns(onAction),
    height: 'auto',
    proxyConfig: {
      ajax: {
        query: async ({ page }: any, values: Record<string, any>) => {
          if (!dictionaryId.value) {
            return { items: [], total: 0 };
          }
          const resp = await getEntryList(dictionaryId.value, {
            pageSize: page.pageSize,
            pageToken: String((page.currentPage - 1) * page.pageSize),
            ...values,
          });
          return { items: resp.entries, total: resp.total };
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
  const payload = { ...values, dictionaryId: dictionaryId.value };
  if (values.id) {
    updateEntry(values.id, payload).then(() => {
      toast.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  } else {
    createEntry(dictionaryId.value!, payload).then(() => {
      toast.success($t('ui.actionMessage.operationSuccess'));
      drawerApi.close();
      refresh();
    });
  }
}

function onAction({ code, row }: any) {
  if (code === 'edit') {
    drawerApi.setData({ ...row, dictionaryId: dictionaryId.value }).open();
  }
  if (code === 'delete') {
    Modal.confirm({
      title: $t('common.deleteConfirm'),
      async onOk() {
        await deleteEntry(row.id);
        toast.success($t('ui.actionMessage.operationSuccess'));
        refresh();
      },
    });
  }
}

async function loadDictionaries() {
  const resp = await getDictionaryList({ pageSize: 200 });
  dictionaryOptions.value = resp.dictionaries.map((d: any) => ({
    label: d.name,
    value: d.id,
  }));
  // 优先使用 URL 中的 dictionaryId；URL 未指定时回退到列表首项
  const preferred = urlDictionaryId.value;
  if (preferred && dictionaryOptions.value.some((d) => d.value === preferred)) {
    dictionaryId.value = preferred;
  } else if (!dictionaryId.value && dictionaryOptions.value.length) {
    dictionaryId.value = dictionaryOptions.value[0]?.value;
  }
}

function onDictionaryChange(value: any) {
  dictionaryId.value = value;
  // 同步到 URL，便于分享与后退
  setDictionaryId(value);
  refresh();
}

// 监听 URL dictionaryId 变化（如浏览器后退）
watch(urlDictionaryId, (v) => {
  if (v && v !== dictionaryId.value) {
    dictionaryId.value = v;
    refresh();
  }
});

onMounted(loadDictionaries);
</script>

<template>
  <Page auto-content-height>
    <Drawer @success="onSubmit" />
    <Grid :table-title="$t('evie.dictionaryCenter.entries')">
      <template #toolbar-tools>
        <Select
          v-model:value="dictionaryId"
          class="!w-56"
          :options="dictionaryOptions"
          :placeholder="$t('evie.dictionary.selectDictionary')"
          show-search
          option-filter-prop="label"
          @change="onDictionaryChange"
        />
        <Button
          type="primary"
          :disabled="!dictionaryId"
          @click="drawerApi.setData({ dictionaryId }).open()"
        >
          <Plus class="size-5" />
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
    <Empty
      v-if="!dictionaryId"
      :description="$t('evie.dictionary.selectDictionary')"
    />
  </Page>
</template>