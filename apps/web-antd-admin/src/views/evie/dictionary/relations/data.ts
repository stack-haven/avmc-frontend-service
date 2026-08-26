import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';
import { Tag } from 'ant-design-vue';

import { $t } from '#/locales';
import { relationColor } from '#/views/evie/_shared/tokens';

export const relationTypeOptions = [
  { label: $t('evie.relation.typeAlias'), value: 'ALIAS' },
  { label: $t('evie.relation.typeCorrection'), value: 'CORRECTION' },
  { label: $t('evie.relation.typeHomophone'), value: 'HOMOPHONE' },
  { label: $t('evie.relation.typePhoneticSimilar'), value: 'PHONETIC_SIMILAR' },
  { label: $t('evie.relation.typeAbbreviation'), value: 'ABBREVIATION' },
  { label: $t('evie.relation.typeRelated'), value: 'RELATED' },
];

export const statusOptions = [
  { label: $t('evie.dictionary.enabled'), value: 1 },
  { label: $t('evie.dictionary.disabled'), value: 2 },
];

export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Select',
    fieldName: 'entryId',
    label: $t('evie.relation.entryId'),
    rules: 'required',
    // entryId Select 在 modules/form.vue 中根据 drawerApi 传入的 dictionaryId 动态加载
    dependencies: {
      // 随 dictionaryId 变化重新加载 options
      triggerFields: ['dictionaryId'],
    },
  },
  {
    component: 'Select',
    componentProps: { options: relationTypeOptions },
    defaultValue: 'ALIAS',
    fieldName: 'relationType',
    label: $t('evie.relation.relationType'),
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'relatedText',
    label: $t('evie.relation.relatedText'),
    rules: 'required',
  },
  {
    component: 'InputNumber',
    componentProps: { class: 'w-full', min: 0 },
    fieldName: 'targetEntryId',
    label: $t('evie.relation.targetEntryId'),
  },
  {
    component: 'Input',
    fieldName: 'source',
    label: $t('evie.dictionary.source'),
  },
  {
    component: 'Textarea',
    fieldName: 'description',
    label: $t('evie.dictionary.description'),
  },
];

export const searchSchema = (): VbenFormSchema[] => [
  {
    component: 'Select',
    componentProps: { allowClear: true, options: relationTypeOptions },
    fieldName: 'relationType',
    label: $t('evie.relation.relationType'),
  },
  {
    component: 'Input',
    fieldName: 'keyword',
    label: $t('evie.relation.keyword'),
  },
];

export const columns = (
  onClick: OnActionClickFn<any>,
): VxeTableGridOptions['columns'] => [
  // 自然语言化展示：相关表达 → 关系类型 → 标准词
  // （后端 Backend-0 P0 ListRelationsByDictionary 已 JOIN entry_standard_text / related_standard_text）
  {
    field: 'relatedText',
    title: $t('evie.relation.relatedText'),
    minWidth: 160,
  },
  {
    field: 'relationType',
    minWidth: 100,
    title: $t('evie.relation.relationType'),
    // 用 evie 关系类型色渲染（ALIAS 灰 / CORRECTION 红 / HOMOPHONE 橙 / ...）
    cellRender: (({ row }: { row: any }) =>
      h(
        Tag,
        {
          color: relationColor(row.relationType),
          style: { border: 'none', fontWeight: 500 },
        },
        () => relationTypeLabel(row.relationType),
      )) as any,
  },
  {
    field: 'entryStandardText',
    minWidth: 140,
    title: $t('evie.relation.entryStandardText'),
  },
  {
    field: 'relatedStandardText',
    minWidth: 140,
    title: $t('evie.relation.relatedStandardText'),
  },
  {
    align: 'center',
    cellRender: {
      attrs: { options: statusOptions },
      name: 'CellTag',
    },
    field: 'status',
    title: $t('evie.dictionary.status'),
    width: 100,
  },
  {
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 170,
  },
  {
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'relatedText',
        onClick,
        options: [
          { code: 'edit', text: $t('common.edit') },
          { code: 'delete', text: $t('common.delete') },
        ],
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('evie.dictionary.operation'),
    width: 150,
  },
];

export function relationTypeLabel(value?: string) {
  return relationTypeOptions.find((o) => o.value === value)?.label ?? value ?? '-';
}
