import { $t } from '#/locales';

export namespace ApiType {
  export const Enabled = 'STATUS_ENABLED';
  export const Disabled = 'STATUS_DISABLED';
  export const StatusOptions = () => [
    { color: 'success', label: $t('common.enabled'), value: Enabled },
    { color: 'error', label: $t('common.disabled'), value: Disabled },
  ];
  export const SwitchOptions = () => {
    return {
      checkedChildren: $t('common.enabled'),
      checkedValue: Enabled,
      unCheckedChildren: $t('common.disabled'),
      unCheckedValue: Disabled,
    };
  };

  /**
   * 分页通用结果
   */
  export interface ListResponse<T> {
    items: T[];
    total?: number;
  }
}
