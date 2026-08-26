<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { getEntryList } from '#/api/evie';
import { $t } from '#/locales';

import { formSchema, relationTypeHelpMap, relationTypeOptions } from '../data';

const emit = defineEmits<{ success: [values: Record<string, any>] }>();
const editId = ref<number>();
const entryOptions = ref<{ label: string; value: number }[]>([]);

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
    // 所属词条通常与目标标准词一致：若用户只选了目标标准词，自动填充所属词条
    if (!values.entryId && values.targetEntryId) {
      values.entryId = values.targetEntryId;
    }
    emit('success', { ...values, id: editId.value });
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = drawerApi.getData<Record<string, any>>();
      formApi.resetForm();
      editId.value = data?.id;
      if (data?.id) {
        formApi.setValues(data);
      }
    }
  },
});

// 加载全部词条（供所属词条/目标词条选择）
async function loadAllEntries() {
  try {
    const resp = await getEntryList(0, { pageSize: 1000 });
    entryOptions.value = resp.entries.map((e: any) => ({
      label: `${e.standardText} (#${e.dictionaryId})`,
      value: e.id,
    }));
    formApi.updateSchema([
      {
        fieldName: 'entryId',
        componentProps: { options: entryOptions.value, showSearch: true, optionFilterProp: 'label' },
      },
      {
        fieldName: 'targetEntryId',
        componentProps: { options: entryOptions.value, showSearch: true, optionFilterProp: 'label' },
      },
    ]);
  } catch {
    entryOptions.value = [];
  }
}

onMounted(loadAllEntries);
</script>

<template>
  <Drawer>
    <Form />
    <div class="mt-4 rounded-md bg-muted/50 p-3">
      <div class="mb-2 text-sm font-medium">
        {{ $t('evie.relation.relationType') }}
      </div>
      <ul class="space-y-1.5 text-xs text-muted-foreground">
        <li v-for="opt in relationTypeOptions" :key="opt.value">
          <span class="font-medium text-foreground">{{ opt.label }}</span>
          ：{{ relationTypeHelpMap[opt.value] }}
        </li>
      </ul>
    </div>
  </Drawer>
</template>
