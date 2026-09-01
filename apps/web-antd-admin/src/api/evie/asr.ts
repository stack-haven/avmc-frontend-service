import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface AsrRecord {
  id: number;
  userId: number;
  sessionId: string;
  rawText: string;
  confidence: number;
  durationMs: number;
  audioFormat: string;
  engine: string;
  createdAt: string;
}

/**
 * 纯语音识别响应。
 */
export interface EnhanceChange {
  from: string;
  to: string;
  type: string;        // ALIAS/CLEAN/FILLER/REPLACE/PHONETIC/FUZZY/CONTEXT
  confidence: number;
}

export interface RecognizeResult {
  requestId: string;
  sessionId: string;     // 后端统一生成的 UUID session_id
  rawText: string;       // ASR 原始文本
  enhancedText: string;  // 增强后文本
  confidence: number;
  durationMs: number;
  // ===== 增强结果（自动随 ASR 走 8 层流水线） =====
  changes?: EnhanceChange[];
  status?: number;       // 1=SUCCESS 2=DEGRADED 3=FAILED
  processingTimeMs?: number;
  cleaningTimeMs?: number;
  fillerTimeMs?: number;
  vocabMatchTimeMs?: number;
  aliasTimeMs?: number;
  deterministicTimeMs?: number;
  pinyinTimeMs?: number;
  fuzzyTimeMs?: number;
  contextTimeMs?: number;
  isFinal: boolean;
  providerName: string;
}

export interface RecognizeParams {
  audioData: string;
  encoding?: number;
  sampleRate?: number;
  /**
   * 增强场景 ID（0=按租户默认；非 0=按场景关联策略）。
   * 系统设计：增强策略只能通过场景 Profile 关联，不接受 policyId 直传。
   */
  profileId?: number;
}

/**
 * 统一识别入口（语音识别 + 文本增强）。
 * - 后端 POST /evie/v1/asr:recognize
 * - profileId=0：按租户默认策略（或不强增强）
 * - profileId>0：按场景关联策略增强
 */
export const recognize = (data: RecognizeParams) =>
  requestClient.post<RecognizeResult>(
    '/evie/v1/asr:recognize',
    {
      format: { encoding: data.encoding ?? 4, sample_rate: data.sampleRate ?? 16000 },
      audio_data: data.audioData,
      profile_id: data.profileId ?? 0,
    },
    // 讯飞 IAT 实时流式按 40ms/帧节流发送，识别耗时约 = 音频时长 + 网络往返，
    // 需远超默认 10s 超时。
    { timeout: 120_000 },
  );

export const getAsrRecordList = (params?: Recordable<any>) =>
  requestClient.get<{ records: AsrRecord[]; total: number }>('/evie/v1/asr/records', {
    params,
  });

export const getAsrRecord = (id: number) =>
  requestClient.get<AsrRecord>(`/evie/v1/asr/records/${id}`);

export interface EnhancementStepSnapshot {
  step: string;
  before?: string;
  after?: string;
  durationMs?: number;
  skipped?: boolean;
  changes?: { from?: string; to?: string; type?: string; confidence?: number }[];
}

export interface AsrRecordDetail {
  record: AsrRecord;
  enhancedText?: string;
  policyName?: string;
  profileName?: string;
  stepSnapshots?: EnhancementStepSnapshot[];
  changes?: { from?: string; to?: string; type?: string; confidence?: number }[];
}

export const getAsrRecordDetail = (id: number) =>
  requestClient.get<AsrRecordDetail>(`/evie/v1/asr/records/${id}/detail`);

export const getAsrRecordAudio = (id: number) =>
  requestClient.get<{ audioData: string; contentType: string }>(
    `/evie/v1/asr/records/${id}/audio`,
  );

/**
 * 重新识别已有记录（纯 ASR，不增强）。
 * - 后端 POST /evie/v1/asr/records/{id}:re-recognize
 */
export const reRecognize = (id: number, profileId?: number) =>
  requestClient.post<RecognizeResult>(
    `/evie/v1/asr/records/${id}:re-recognize`,
    { profile_id: profileId ?? 0 },
    { timeout: 120_000 },
  );

/**
 * 纯文本增强（不经过 ASR，直接对输入文本做增强）
 * - 用于：人工输入的文本需要做企业语言规范化
 */
