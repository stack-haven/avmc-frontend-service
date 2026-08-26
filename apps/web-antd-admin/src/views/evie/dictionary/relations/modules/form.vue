<script setup lang="ts">
import { ref, watch } from 'vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { getEntryList } from '#/api/evie';

import { formSchema } from '../data';

const emit = defineEmits<{ success: [values: Record<string, any>] }>();
const editId = ref<number>();

// 词条 Select 选项：随 drawer 传入的 dictionaryId 动态加载
const entryOptions = ref<{ label: string; value: number }[]>([]);
const dictionaryId = ref<number>();

const [Form, formApi] = useVbenForm({
  schema: formSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onCancel: () => drawerApi.close(),
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    emit('success', { ...values, id: editId.value });
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<Record<string, any>>();
      editId.value = data?.id;
      dictionaryId.value = data?.dictionaryId;
      // 先加载词条 options，再 setValues，确保 entryId 能正确回显
      openWithData(data);
    }
  },
});

async function openWithData(data?: Record<string, any>) {
  formApi.resetForm();
  if (dictionaryId.value) {
    await loadEntries(dictionaryId.value);
  }
  if (data?.id) {
    formApi.setValues(data);
  }
}

// 根据 dictionaryId 加载该词库下的所有词条（供 entryId Select 选）。
async function loadEntries(dId: number) {
  try {
    const resp = await getEntryList(dId, { pageSize: 1000 });
    entryOptions.value = resp.entries.map((e: any) => ({
      label: e.standardText,
      value: e.id,
    }));
  } catch {
    entryOptions.value = [];
  }
}

// 当 entryId Select 变化时，同步给 formApi（Vben form 用 updateSchema 动态更新 options）
watch(entryOptions, (opts) => {
  formApi.updateSchema([
    {
      fieldName: 'entryId',
      componentProps: { options: opts, showSearch: true, optionFilterProp: 'label' },
    },
  ]);
});

watch(dictionaryId, (dId) => {
  if (dId) {
    loadEntries(dId);
    // 切换词库时清空 entryId（避免与新词库下的词条 ID 不匹配）
    formApi.setValues({ entryId: undefined });
  }
});
</script>

<template>
  <Drawer>
    <Form />
  </Drawer>
</template>
