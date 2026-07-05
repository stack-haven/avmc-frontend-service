import type { VbenFormSchema } from '#/adapter/form';
import type {
  OnActionClickFn,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { ParameterApi } from '#/api';

import { ApiType } from '#/api';
import { $t } from '#/locales';

export const valueTypeOptions = () => [
  { label: $t('system.parameter.string'), value: 'PARAMETER_VALUE_TYPE_STRING' },
  { label: $t('system.parameter.integer'), value: 'PARAMETER_VALUE_TYPE_INTEGER' },
  { label: $t('system.parameter.boolean'), value: 'PARAMETER_VALUE_TYPE_BOOLEAN' },
  { label: 'JSON', value: 'PARAMETER_VALUE_TYPE_JSON' },
];

const valueTypeLabel = (value: ParameterApi.ValueType) =>
  valueTypeOptions().find((item) => item.value === value)?.label ?? value;

export const definitionFormSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'key', label: $t('system.parameter.key'), rules: 'required' },
  { component: 'Input', fieldName: 'name', label: $t('system.parameter.name'), rules: 'required' },
  { component: 'Select', componentProps: { options: valueTypeOptions() }, defaultValue: 'PARAMETER_VALUE_TYPE_STRING', fieldName: 'valueType', label: $t('system.parameter.valueType'), rules: 'required' },
  { component: 'Textarea', componentProps: { autoSize: { maxRows: 8, minRows: 3 } }, fieldName: 'defaultValue', label: $t('system.parameter.defaultValue') },
  { component: 'Switch', defaultValue: true, fieldName: 'tenantOverridable', label: $t('system.parameter.tenantOverridable') },
  { component: 'RadioGroup', componentProps: { optionType: 'button', options: ApiType.StatusOptions() }, defaultValue: ApiType.Enabled, fieldName: 'status', label: $t('system.parameter.status') },
  { component: 'InputNumber', componentProps: { class: 'w-full', min: 0 }, defaultValue: 10, fieldName: 'sort', label: $t('system.parameter.sort') },
  { component: 'Textarea', fieldName: 'description', label: $t('system.parameter.description') },
];

export const definitionSearchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'key', label: $t('system.parameter.key') },
  { component: 'Input', fieldName: 'name', label: $t('system.parameter.name') },
  { component: 'Select', componentProps: { allowClear: true, options: valueTypeOptions() }, fieldName: 'valueType', label: $t('system.parameter.valueType') },
];

export const definitionColumns = (
  onClick: OnActionClickFn<ParameterApi.Definition>,
): VxeTableGridOptions['columns'] => [
  { field: 'key', minWidth: 220, title: $t('system.parameter.key') },
  { field: 'name', minWidth: 160, title: $t('system.parameter.name') },
  { field: 'valueType', formatter: ({ cellValue }) => valueTypeLabel(cellValue), width: 110, title: $t('system.parameter.valueType') },
  { field: 'defaultValue', minWidth: 200, showOverflow: 'tooltip', title: $t('system.parameter.defaultValue') },
  { field: 'tenantOverridable', formatter: ({ cellValue }) => cellValue ? $t('common.yes') : $t('common.no'), width: 110, title: $t('system.parameter.tenantOverridable') },
  { cellRender: { name: 'CellTag', props: ApiType.SwitchOptions() }, field: 'status', width: 90, title: $t('system.parameter.status') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [{ code: 'edit', text: $t('common.edit') }, { code: 'delete', text: $t('common.delete') }] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.parameter.operation'), width: 150 },
];

export const currentSearchSchema = (): VbenFormSchema[] => [
  { component: 'Input', fieldName: 'key', label: $t('system.parameter.key') },
];

export const currentColumns = (
  onClick: OnActionClickFn<ParameterApi.Resolved>,
): VxeTableGridOptions['columns'] => [
  { field: 'key', minWidth: 220, title: $t('system.parameter.key') },
  { field: 'name', minWidth: 160, title: $t('system.parameter.name') },
  { field: 'valueType', formatter: ({ cellValue }) => valueTypeLabel(cellValue), width: 110, title: $t('system.parameter.valueType') },
  { field: 'value', minWidth: 240, showOverflow: 'tooltip', title: $t('system.parameter.effectiveValue') },
  { field: 'source', formatter: ({ cellValue }) => cellValue === 'PARAMETER_VALUE_SOURCE_TENANT_OVERRIDE' ? $t('system.parameter.tenantOverride') : $t('system.parameter.platformDefault'), width: 130, title: $t('system.parameter.source') },
  { align: 'center', cellRender: { attrs: { nameField: 'name', onClick, options: [{ code: 'override', text: $t('system.parameter.override') }, { code: 'reset', text: $t('system.parameter.reset') }] }, name: 'CellOperation' }, field: 'operation', fixed: 'right', title: $t('system.parameter.operation'), width: 170 },
];
