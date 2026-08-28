<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Spin,
  Tag,
  message,
} from 'ant-design-vue';

import { enhanceText, getProfileList } from '#/api/evie';
import { $t } from '#/locales';

defineOptions({ name: 'EviePureTextEnhancement' });

interface EnhanceResponse {
  originalText: string;
  enhancedText: string;
  changes?: { from: string; to: string; type: string; confidence: number }[];
  status?: number;
  processingTimeMs?: number;
  cleaningTimeMs?: number;
  fillerTimeMs?: number;
  vocabMatchTimeMs?: number;
  aliasTimeMs?: number;
  deterministicTimeMs?: number;
  pinyinTimeMs?: number;
  fuzzyTimeMs?: number;
  contextTimeMs?: number;
  errorMessage?: string;
}

const inputText = ref('');
const profileId = ref<number | undefined>(undefined);
const profileOptions = ref<{ label: string; value: number }[]>([]);

const loading = ref(false);
const result = ref<EnhanceResponse | null>(null);

const stepTimingEntries = (r?: EnhanceResponse) =>
  [
    { label: $t('evie.enhancement.cleaningTimeMs'), value: r?.cleaningTimeMs },
    { label: $t('evie.enhancement.fillerTimeMs'), value: r?.fillerTimeMs },
    { label: $t('evie.enhancement.vocabMatchTimeMs'), value: r?.vocabMatchTimeMs },
    { label: $t('evie.enhancement.aliasTimeMs'), value: r?.aliasTimeMs },
    { label: $t('evie.enhancement.deterministicTimeMs'), value: r?.deterministicTimeMs },
    { label: $t('evie.enhancement.pinyinTimeMs'), value: r?.pinyinTimeMs },
    { label: $t('evie.enhancement.fuzzyTimeMs'), value: r?.fuzzyTimeMs },
    { label: $t('evie.enhancement.contextTimeMs'), value: r?.contextTimeMs },
  ];

const statusMeta = (status?: number) => {
  if (status === 1) return { color: 'success', text: $t('evie.enhancement.statusSuccess') };
  if (status === 2) return { color: 'warning', text: $t('evie.enhancement.statusDegraded') };
  if (status === 3) return { color: 'error', text: $t('evie.enhancement.statusFailed') };
  return { color: 'default', text: '-' };
};

async function loadProfiles() {
  try {
    const resp = await getProfileList({ pageSize: 200 });
    profileOptions.value = [
      { label: $t('evie.enhancement.pureTextSceneDefault'), value: -1 },
      ...(resp.profiles ?? []).map((p: any) => ({
        label: `${p.name}${p.policyId ? ` (#${p.id})` : ''}`,
        value: p.id as number,
      })),
    ];
  } catch {
    profileOptions.value = [{ label: $t('evie.enhancement.pureTextSceneDefault'), value: -1 }];
  }
}

async function runEnhance() {
  if (!inputText.value.trim()) {
    message.warning($t('ui.formRules.required', [$t('evie.asr.rawText')] as never) ?? '请输入文本');
    return;
  }
  loading.value = true;
  result.value = null;
  try {
    const pid = profileId.value && profileId.value > 0 ? profileId.value : 0;
    const resp = await enhanceText(inputText.value, `pure-${Date.now()}`, pid);
    result.value = resp as EnhanceResponse;
  } catch (e: any) {
    message.error(e?.message ?? '增强失败');
  } finally {
    loading.value = false;
  }
}

onMounted(loadProfiles);
</script>

<template>
  <Page :title="$t('evie.enhancement.pureText')" auto-content-height>
    <Row :gutter="16">
      <Col :span="12">
        <Card :bordered="false">
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium">{{
                $t('evie.enhancement.pureTextSceneLabel')
              }}</label>
              <Select
                v-model:value="profileId"
                :options="profileOptions"
                :placeholder="$t('evie.enhancement.pureTextSceneLabel')"
                show-search
                option-filter-prop="label"
                class="w-full"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">{{
                $t('evie.enhancement.pureTextInputPlaceholder')
              }}</label>
              <Input.TextArea
                v-model:value="inputText"
                :auto-size="{ minRows: 10, maxRows: 20 }"
                :maxlength="4096"
                :placeholder="$t('evie.enhancement.pureTextInputPlaceholder')"
              />
            </div>
            <div>
              <Button
                type="primary"
                :loading="loading"
                :disabled="!inputText.trim()"
                @click="runEnhance"
              >
                {{ $t('evie.enhancement.pureTextRun') }}
              </Button>
            </div>
          </div>
        </Card>
      </Col>

      <Col :span="12">
        <Spin :spinning="loading" :tip="$t('evie.enhancement.pureTextRunning')">
          <Card :bordered="false">
            <template v-if="result">
              <div class="mb-3 flex items-center justify-between">
                <Tag :color="statusMeta(result.status).color">
                  {{ statusMeta(result.status).text }}
                </Tag>
                <span v-if="result.processingTimeMs" class="text-sm text-gray-500">
                  {{ result.processingTimeMs }} ms
                </span>
              </div>

              <div class="mb-3">
                <div class="mb-1 text-sm text-gray-500">
                  {{ $t('evie.enhancement.pureTextOriginalLabel') }}
                </div>
                <div
                  class="rounded bg-gray-50 p-2 text-sm whitespace-pre-wrap dark:bg-gray-800"
                >
                  {{ result.originalText }}
                </div>
              </div>

              <div class="mb-3">
                <div class="mb-1 text-sm text-gray-500">
                  {{ $t('evie.enhancement.pureTextEnhancedLabel') }}
                </div>
                <div
                  class="rounded bg-green-50 p-2 text-sm whitespace-pre-wrap dark:bg-green-950"
                >
                  {{ result.enhancedText }}
                </div>
              </div>

              <div v-if="result.changes && result.changes.length > 0" class="mb-3">
                <div class="mb-1 text-sm text-gray-500">
                  {{ $t('evie.enhancement.pureTextChangeListLabel') }}
                </div>
                <div
                  class="max-h-60 overflow-auto rounded border border-gray-200 p-2 text-xs dark:border-gray-700"
                >
                  <div
                    v-for="(c, i) in result.changes"
                    :key="i"
                    class="border-b border-gray-100 py-1 last:border-b-0 dark:border-gray-800"
                  >
                    <Tag :color="c.type === 'PHONETIC' ? 'orange' : c.type === 'CONTEXT' ? 'blue' : 'purple'">
                      {{ c.type }}
                    </Tag>
                    <span class="ml-2 font-mono">{{ c.from }}</span>
                    <span class="mx-1 text-gray-400">→</span>
                    <span class="font-mono">{{ c.to }}</span>
                    <span class="ml-2 text-gray-400">({{ c.confidence.toFixed(2) }})</span>
                  </div>
                </div>
              </div>
              <Empty
                v-else
                :description="$t('evie.enhancement.pureTextNoChange')"
                :image="Empty.PRESENTED_IMAGE_SIMPLE"
              />

              <div v-if="result.errorMessage" class="mt-3">
                <Alert :message="result.errorMessage" type="error" show-icon />
              </div>

              <div class="mt-3">
                <div class="mb-1 text-sm text-gray-500">
                  {{ $t('evie.enhancement.pureTextStageTimingLabel') }}
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div
                    v-for="(t, i) in stepTimingEntries(result)"
                    :key="i"
                    class="flex justify-between rounded bg-gray-50 px-2 py-1 dark:bg-gray-800"
                  >
                    <span>{{ t.label }}</span>
                    <span class="font-mono">{{ t.value ?? 0 }} ms</span>
                  </div>
                </div>
              </div>
            </template>
            <Empty
              v-else
              :description="$t('evie.enhancement.pureTextInputPlaceholder')"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </Card>
        </Spin>
      </Col>
    </Row>
  </Page>
</template>
