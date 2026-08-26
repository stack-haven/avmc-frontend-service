<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { Collapse, CollapsePanel, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { useVbenDrawer } from '@vben/common-ui';

import { generatePinyin, getDictionaryList } from '#/api/evie';
import { $t } from '#/locales';

import { formSchema } from '../data';

const emit = defineEmits<{ success: [values: Record<string, any>] }>();
const editId = ref<number>();

// 高级字段（拼音/规范化/描述）默认折叠，避免与必填字段视觉竞争
const advancedActive = ref<string[]>([]);
const pinyinLoading = ref(false);

// 加载词库下拉（新建/编辑均可直接搜索选择词库）
async function loadDictionaries() {
  try {
    const resp = await getDictionaryList({ pageSize: 200 });
    const options = resp.dictionaries.map((d: any) => ({
      label: d.name,
      value: d.id,
    }));
    formApi.updateSchema([
      {
        fieldName: 'dictionaryId',
        componentProps: { options, showSearch: true, optionFilterProp: 'label' },
      },
    ]);
  } catch {
    // 忽略：表单仍可打开，提交时校验必填
  }
}

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
      formApi.resetForm();
      editId.value = data?.id;
      // 编辑模式：所有字段可见；新建模式：高级字段默认折叠
      advancedActive.value = data?.id ? ['advanced'] : [];
      if (data?.id) {
        formApi.setValues(data);
      } else {
        // 新建：若 list 已预选词库则带入
        if (data?.dictionaryId) {
          formApi.setValues({ dictionaryId: data.dictionaryId });
        }
        if (data?.standardText) {
          handleStandardTextChange(data.standardText);
        }
      }
    }
  },
});

/**
 * standardText 变化时自动调用后端 generatePinyin 填充拼音字段。
 * 仅在 standardText 长度 >= 2 时触发（避免空值/单字拼音意义不大）。
 * 失败时由 pkg/pinyin 前端 fallback 返回空 result（不报错），用户可手动填写。
 */
async function handleStandardTextChange(text: string) {
  if (!text || text.length < 2) return;
  pinyinLoading.value = true;
  try {
    const res = await generatePinyin(text, true);
    if (res.pinyin) {
      formApi.setValues({
        pinyin: res.pinyin,
        pinyinInitial: res.pinyinInitial,
        normalizedText: res.normalizedText,
      });
      // 自动展开高级字段，让用户看到生成的拼音
      if (!advancedActive.value.includes('advanced')) {
        advancedActive.value = ['advanced'];
      }
    }
  } catch {
    // 失败不阻断主流程，让用户手动填写
    message.warning($t('evie.pinyin.generateFailed'));
  } finally {
    pinyinLoading.value = false;
  }
}

// 监听 standardText 变化（debounce 由 vben-form 内部处理）
watch(
  () => formApi.form?.values?.standardText,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && newVal.length >= 2) {
      handleStandardTextChange(newVal);
    }
  },
);

onMounted(loadDictionaries);
</script>

<template>
  <Drawer>
    <Form>
      <template #default="slotProps">
        <div v-bind="slotProps">
          <!-- 必填信息组：dictionaryId / standardText / entryType / category / priority -->
          <slot name="field-groupBasic" />
          <slot name="field-dictionaryId" />
          <slot name="field-standardText" />
          <slot name="field-entryType" />
          <slot name="field-category" />
          <slot name="field-priority" />

          <!-- 高级字段组：默认折叠；编辑模式自动展开 -->
          <Collapse v-model:active-key="advancedActive" ghost>
            <CollapsePanel key="advanced" :header="$t('evie.entry.advancedFields')">
              <template v-if="pinyinLoading">
                <div :style="{ color: '#999', fontSize: '12px', marginBottom: '8px' }">
                  {{ $t('evie.pinyin.generating') }}
                </div>
              </template>
              <slot name="field-pinyin" />
              <slot name="field-pinyinInitial" />
              <slot name="field-normalizedText" />
              <slot name="field-description" />
            </CollapsePanel>
          </Collapse>
        </div>
      </template>
    </Form>
  </Drawer>
</template>