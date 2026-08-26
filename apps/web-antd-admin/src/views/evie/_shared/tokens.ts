/**
 * Evie 设计 token（产品服务模块视觉语言范例）
 *
 * 来源：docs/services/evie-platform/词库中心交互优化方案.md
 *       .agents/DESIGN.md「产品服务模块设计模式」章节
 *
 * 适用范围：apps/web-antd-admin 中所有 /views/evie/** 页面与组件。
 * 不要把 evie token 用于其他产品服务（Geo Engine / AI Agent 应独立配色）。
 */

// 主色：evie 深靛蓝——区别于平台默认蓝，避免视觉冲突。
export const EVIE_PRIMARY = '#1F4FCC';
export const EVIE_PRIMARY_HOVER = '#3D67D6';
export const EVIE_PRIMARY_ACTIVE = '#1638A0';

// 业务色：按业务域划分子色，便于一眼识别当前模块。
export const EVIE_COLOR_VOICE = '#1F4FCC';      // ASR 语音识别相关
export const EVIE_COLOR_VOCABULARY = '#7B5BE8'; // 词库相关
export const EVIE_COLOR_ENHANCE = '#16A085';    // 文本增强相关

// 多租户 scope 颜色（PLATFORM/SYSTEM/TENANT 三色统一规范）。
// 详见 .agents/DESIGN.md「多租户 scope 视觉化」。
export const SCOPE_COLORS = {
  PLATFORM: '#6F42C1', // 紫色——全平台共享
  SYSTEM: '#0D6EFD',   // 蓝色——系统级
  TENANT: '#198754',    // 绿色——租户私有
} as const;

// 词条关系类型颜色（ALIAS/CORRECTION/HOMOPHONE/PHONETIC_SIMILAR/ABBREVIATION/RELATED）。
export const RELATION_COLORS = {
  ALIAS: '#6C757D',
  CORRECTION: '#DC3545',
  HOMOPHONE: '#FD7E14',
  PHONETIC_SIMILAR: '#FFC107',
  ABBREVIATION: '#20C997',
  RELATED: '#0DCAF0',
} as const;

export type ScopeType = keyof typeof SCOPE_COLORS;
export type RelationType = keyof typeof RELATION_COLORS;

/**
 * scope 色映射辅助函数：接受任意大小写输入，输出对应颜色。
 * 用于表格 formatter 渲染 ant-design-vue Tag。
 */
export function scopeColor(scope?: string): string {
  const key = (scope ?? '').toUpperCase() as ScopeType;
  return SCOPE_COLORS[key] ?? SCOPE_COLORS.TENANT;
}

/**
 * relation 色映射辅助函数。
 */
export function relationColor(relation?: string): string {
  const key = (relation ?? '').toUpperCase() as RelationType;
  return RELATION_COLORS[key] ?? RELATION_COLORS.ALIAS;
}

/**
 * evie 视觉布局常量。
 * 圆角比 antd 默认 6px 更大（12-16px），更现代。
 */
export const EVIE_RADIUS = {
  card: '12px',
  button: '8px',
  input: '8px',
  badge: '10px',
} as const;

/**
 * evie 间距规范（8 倍数体系）。
 */
export const EVIE_SPACING = {
  sectionGap: '24px',
  cardGap: '16px',
  fieldGap: '12px',
} as const;