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

export interface RecognizeAndCorrectResult {
  originalText: string;
  correctedText: string;
  changes: { from: string; to: string; type: string; confidence: number }[];
  confidence: number;
  providerName: string;
}

export const recognizeAndCorrect = (data: {
  sessionId: string;
  audioData: string;
  encoding?: number;
  sampleRate?: number;
}) =>
  requestClient.post<RecognizeAndCorrectResult>(
    '/evie/v1/asr:recognize-and-correct',
    {
      session_id: data.sessionId,
      format: { encoding: data.encoding ?? 4, sample_rate: data.sampleRate ?? 16000 },
      audio_data: data.audioData,
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

export const getAsrRecordAudio = (id: number) =>
  requestClient.get<{ audioData: string; contentType: string }>(
    `/evie/v1/asr/records/${id}/audio`,
  );

export const reRecognize = (id: number) =>
  requestClient.post<RecognizeAndCorrectResult>(
    `/evie/v1/asr/records/${id}:re-recognize`,
    {},
    { timeout: 120_000 },
  );
