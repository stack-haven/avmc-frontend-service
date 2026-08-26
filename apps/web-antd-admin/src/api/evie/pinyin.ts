import { requestClient } from '#/api/request';

/**
 * 拼音生成结果。
 * 后端 P0 接口 GeneratePinyin 的响应（pkg/pinyin 实现）。
 */
export interface PinyinResult {
  pinyin: string;        // 全拼（空格分隔），如 "ke fu nin hao"
  pinyinInitial: string; // 拼音首字母（连续无分隔），如 "kfnh"
  normalizedText: string; // 规范化后文本（去除 ASCII/全角标点 + 合并空白）
}

/**
 * 调用后端 GeneratePinyin 生成中文文本拼音。
 * 失败时降级返回空 result（让调用方决定如何处理）。
 */
export const generatePinyin = (
  text: string,
  includeInitials = true,
): Promise<PinyinResult> =>
  requestClient
    .post<{ pinyin: string; pinyinInitial: string; normalizedText: string }>(
      '/evie/v1/pinyin:generate',
      { text, includeInitials },
    )
    .then((res) => ({
      pinyin: res.pinyin ?? '',
      pinyinInitial: res.pinyinInitial ?? '',
      normalizedText: res.normalizedText ?? text,
    }))
    .catch(() => ({
      pinyin: '',
      pinyinInitial: '',
      normalizedText: text,
    }));