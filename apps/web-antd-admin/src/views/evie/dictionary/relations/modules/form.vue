<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

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
      // 根据关系类型控制「所属词条」显隐
      updateEntryVisibility(data?.relationType || 'ALIAS');
    }
  },
});

// 加载全部词条（供所属词条/目标词条选择）
// 关系类型决定「所属词条」是否显示：
// ALIAS/CORRECTION/同音/音近/缩写 只需目标标准词（所属自动=目标）；
// RELATED 需要单独指定所属词条。
function updateEntryVisibility(relationType?: string) {
  const isRelated = relationType === 'RELATED';
  formApi.updateSchema([
    {
      fieldName: 'entryId',
      show: isRelated,
    } as any,
  ]);
}

// 监听关系类型变化：非 RELATED 时隐藏所属词条
watch(
  () => formApi.form?.values?.relationType,
  (val) => {
    updateEntryVisibility(val as string);
    // 非 RELATED 且选了目标标准词时，自动同步所属词条
    if (val !== 'RELATED' && formApi.form?.values?.targetEntryId) {
      formApi.setValues({ entryId: formApi.form.values.targetEntryId });
    }
  },
);

// 监听目标标准词变化：非 RELATED 时自动填充所属词条
watch(
  () => formApi.form?.values?.targetEntryId,
  (val) => {
    const relType = formApi.form?.values?.relationType;
    if (val && relType !== 'RELATED') {
      formApi.setValues({ entryId: val });
    }
  },
);

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
