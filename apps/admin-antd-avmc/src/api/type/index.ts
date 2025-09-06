import { $t } from '#/locales';

import { enum as enum_ } from '../gen';

export namespace ApiType {
  export const Enabled = enum_.statusToJSON(enum_.Status.STATUS_ENABLED);
  export const Disabled = enum_.statusToJSON(enum_.Status.STATUS_DISABLED);
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
