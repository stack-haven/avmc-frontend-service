import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';
import { Tag } from 'ant-design-vue';

import { $t } from '#/locales';
import { relationColor } from '#/views/evie/_shared/tokens';

export const relationTypeOptions = [
  { label: $t('evie.relation.typeAliasOption'), value: 'ALIAS' },
  { label: $t('evie.relation.typeCorrectionOption'), value: 'CORRECTION' },
  { label: $t('evie.relation.typeHomophoneOption'), value: 'HOMOPHONE' },
  { label: $t('evie.relation.typePhoneticSimilarOption'), value: 'PHONETIC_SIMILAR' },
  { label: $t('evie.relation.typeAbbreviationOption'), value: 'ABBREVIATION' },
  { label: $t('evie.relation.typeRelatedOption'), value: 'RELATED' },
];

export const relationTypeHelpMap: Record<string, string> = {
  ALIAS: $t('evie.relation.typeAliasHelp'),
  CORRECTION: $t('evie.relation.typeCorrectionHelp'),
  HOMOPHONE: $t('evie.relation.typeHomophoneHelp'),
  PHONETIC_SIMILAR: $t('evie.relation.typePhoneticSimilarHelp'),
  ABBREVIATION: $t('evie.relation.typeAbbreviationHelp'),
  RELATED: $t('evie.relation.typeRelatedHelp'),
};

export const statusOptions = [
  { label: $t('evie.dictionary.enabled'), value: 1 },
  { label: $t('evie.dictionary.disabled'), value: 2 },
];

// 关系表单顺序按「新增关系」心智模型：
// 1. 先输入口语/错字（关联表达）
// 2. 再选择关系类型
// 3. 选择增强成的目标标准词
// 4. 所属词条（通常与目标标准词一致，选择目标后自动填充）
// 5. 来源、描述
export const formSchema = (): VbenFormSchema[] => [
  {
    component: 'Input',
    componentProps: {
      placeholder: $t('evie.relation.relatedText'),
    },
    fieldName: 'relatedText',
    label: $t('evie.relation.relatedText'),
    rules: 'required',
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
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [],
      placeholder: $t('evie.relation.targetEntryPlaceholder'),
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'targetEntryId',
    label: $t('evie.relation.targetEntry'),
  },
  {
    component: 'Select',
    componentProps: {
      options: [],
      placeholder: $t('evie.relation.entryPlaceholder'),
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'entryId',
    label: $t('evie.relation.entryId'),
    rules: 'selectRequired',
  },
  {
    component: 'Select',
    componentProps: {
      options: [
        { label: 'MANUAL', value: 'MANUAL' },
        { label: 'SYNC', value: 'SYNC' },
        { label: 'IMPORT', value: 'IMPORT' },
        { label: 'API', value: 'API' },
      ],
    },
    defaultValue: 'MANUAL',
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
    componentProps: {
      allowClear: true,
      options: [],
      placeholder: $t('evie.dictionary.selectDictionary'),
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'dictionaryId',
    label: $t('evie.dictionary.name'),
  },
  {
    component: 'Select',
    componentProps: {
      allowClear: true,
      options: [],
      placeholder: $t('evie.dictionary.selectEntry'),
      showSearch: true,
      optionFilterProp: 'label',
    },
    fieldName: 'entryId',
    label: $t('evie.relation.entryId'),
  },
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
  // （后端已 JOIN entry_standard_text / related_standard_text / dictionary_name）
  {
    field: 'relatedText',
    title: $t('evie.relation.relatedTextLabel'),
    minWidth: 140,
  },
  {
    field: 'relationType',
    minWidth: 130,
    title: $t('evie.relation.relationType'),
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
    field: 'relatedStandardText',
    minWidth: 140,
    title: $t('evie.relation.relatedStandardTextLabel'),
  },
  {
    field: 'entryStandardText',
    minWidth: 130,
    title: $t('evie.relation.entryStandardTextLabel'),
  },
  {
    field: 'dictionaryName',
    minWidth: 110,
    title: $t('evie.relation.dictionaryName'),
  },
  {
    align: 'center',
    cellRender: {
      attrs: { options: statusOptions },
      name: 'CellTag',
    },
    field: 'status',
    title: $t('evie.dictionary.status'),
    width: 90,
  },
  {
    field: 'createdAt',
    title: $t('evie.dictionary.createdAt'),
    width: 160,
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
