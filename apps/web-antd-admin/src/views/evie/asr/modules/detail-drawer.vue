<script setup lang="ts">
import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import {
  Badge,
  Descriptions,
  Empty,
  Space,
  Tag,
  Timeline,
  message,
} from 'ant-design-vue';

import { getAsrRecordAudio, getAsrRecordDetail } from '#/api';
import { $t } from '#/locales';

// connectedComponent 模式下 list 通过 setData(row) 传入
const props = defineProps<{ data?: { id?: number } }>();

const detail = ref<any>();
const audioUrl = ref('');
const loading = ref(false);

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange: async (isOpen: boolean) => {
    if (!isOpen) return;
    // 优先取 drawerApi 数据，兜底取 props.data（兼容 connectedComponent 传参方式）
    const row = drawerApi.getData<{ id?: number }>() ?? props.data;
    const id = row?.id;
    if (!id) return;
    loading.value = true;
    detail.value = undefined;
    audioUrl.value = '';
    try {
      const [detailResp, audioResp] = await Promise.all([
        getAsrRecordDetail(id),
        getAsrRecordAudio(id).catch(() => null),
      ]);
      detail.value = detailResp;
      if (audioResp?.audioData) {
        const bytes = atob(audioResp.audioData);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i += 1) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: audioResp.contentType || 'audio/webm' });
        audioUrl.value = URL.createObjectURL(blob);
      }
    } catch (e: any) {
      message.error(e?.message || '加载详情失败');
    } finally {
      loading.value = false;
    }
  },
  onCancel: () => drawerApi.close(),
});

// 后端 step.Name() 真实取值（保持一致）
const STEP_LABELS: Record<string, string> = {
  cleaning: '文本清洗',
  filler: '口水词处理',
  vocabulary_matching: '词库匹配',
  alias_resolution: '别名解析',
  deterministic_replacement: '确定性替换',
  phrase_standardization: '短语标准化',
  pinyin_correction: '拼音纠错',
  fuzzy_matching: '模糊匹配',
  context_correction: '上下文纠错',
};

const STEP_COLORS: Record<string, string> = {
  cleaning: 'gray',
  filler: 'orange',
  vocabulary_matching: 'purple',
  alias_resolution: 'blue',
  deterministic_replacement: 'green',
  phrase_standardization: 'cyan',
  pinyin_correction: 'geekblue',
  fuzzy_matching: 'gold',
  context_correction: 'magenta',
};

function stepLabel(step?: string) {
  return (step && STEP_LABELS[step]) || step || '-';
}

function changeText(changes?: any[]) {
  if (!changes?.length) return '无变更';
  return changes
    .map((c) => {
      // 删除：to 为空字符串（proto EnhanceChange 仅保留 from/to/type/confidence）
      if (c.to === '' || c.to == null) return `删除「${c.from}」`;
      return `「${c.from}」→「${c.to}」`;
    })
    .join('；');
}

function releaseAudio() {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value);
  audioUrl.value = '';
}
</script>

<template>
  <Drawer
    :title="$t('evie.asr.recordDetail')"
    :width="760"
    destroy-on-close
    @close="releaseAudio"
  >
    <div v-if="loading" class="py-20 text-center text-muted-foreground">
      {{ $t('evie.asr.loadingDetail') }}
    </div>

    <template v-else-if="detail">
      <!-- 顶部：重听 + 元信息 -->
      <div class="mb-4 rounded-lg border p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-medium">{{ $t('evie.asr.replay') }}</span>
          <Tag color="blue">{{ detail.record?.engine }}</Tag>
        </div>
        <audio
          v-if="audioUrl"
          :src="audioUrl"
          controls
          class="w-full"
          style="height: 40px"
        />
        <Empty v-else :description="$t('evie.asr.noAudio')" :image-simple="true" />
        <Descriptions :column="4" size="small" class="mt-3">
          <Descriptions.Item :label="$t('evie.asr.confidence')">
            {{ detail.record?.confidence?.toFixed?.(2) ?? '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('evie.asr.engine')">
            {{ detail.record?.engine || '-' }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('evie.asr.sessionId')">
            {{ detail.record?.sessionId }}
          </Descriptions.Item>
          <Descriptions.Item :label="$t('evie.asr.createdAt')">
            {{ detail.record?.createdAt }}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <!-- 文本对比 -->
      <div class="mb-4 rounded-lg border p-4">
        <div class="mb-2 text-sm font-medium">
          {{ $t('evie.asr.textCompare') }}
        </div>
        <div class="space-y-2">
          <div>
            <div class="mb-1 text-xs text-muted-foreground">
              {{ $t('evie.asr.rawText') }}
            </div>
            <div class="whitespace-pre-wrap text-sm leading-6">
              {{ detail.record?.rawText }}
            </div>
          </div>
          <div>
            <div class="mb-1 text-xs text-muted-foreground">
              {{ $t('evie.asr.enhancedText') }}
            </div>
            <div class="whitespace-pre-wrap text-sm leading-6 font-medium">
              {{ detail.enhancedText || detail.record?.rawText }}
            </div>
          </div>
        </div>
      </div>

      <!-- 增强策略执行步骤图 -->
      <div class="mb-4 rounded-lg border p-4">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-sm font-medium">
            {{ $t('evie.asr.enhanceSteps') }}
          </span>
          <Space>
            <Tag v-if="detail.policyName" color="blue">
              {{ detail.policyName }}
            </Tag>
            <Tag v-if="detail.profileName" color="green">
              {{ detail.profileName }}
            </Tag>
          </Space>
        </div>

        <Timeline v-if="detail.stepSnapshots?.length">
          <Timeline.Item
            v-for="(snap, idx) in detail.stepSnapshots"
            :key="idx"
            :color="snap.skipped ? 'gray' : STEP_COLORS[snap.step] || 'blue'"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ stepLabel(snap.step) }}</span>
              <Badge
                v-if="snap.skipped"
                status="default"
                :text="$t('evie.asr.stepSkipped')"
              />
              <Badge
                v-else
                :status="snap.changes?.length ? 'success' : 'default'"
                :text="`${snap.durationMs ?? 0}ms`"
              />
              <span
                v-if="snap.changes?.length"
                class="text-xs text-muted-foreground"
              >
                {{ $t('evie.asr.changesCount', [snap.changes.length]) }}
              </span>
            </div>
            <div v-if="snap.changes?.length" class="mt-1 text-xs text-muted-foreground">
              {{ changeText(snap.changes) }}
            </div>
            <div
              v-if="!snap.skipped && snap.before !== snap.after"
              class="mt-1 text-xs"
            >
              <span class="text-muted-foreground">{{ $t('evie.asr.stepBefore') }}：</span>
              <span class="line-through text-red-500">{{ snap.before }}</span>
              <span class="mx-1 text-muted-foreground">→</span>
              <span class="text-green-600">{{ snap.after }}</span>
            </div>
          </Timeline.Item>
        </Timeline>
        <Empty v-else :description="$t('evie.asr.noSteps')" :image-simple="true" />
      </div>

      <!-- 变更汇总 -->
      <div v-if="detail.changes?.length" class="rounded-lg border p-4">
        <div class="mb-2 text-sm font-medium">
          {{ $t('evie.asr.changesSummary') }}
        </div>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="(c, idx) in detail.changes"
            :key="idx"
            :color="c.type === 'FUZZY' ? 'gold' : 'green'"
          >
            {{ c.from }} → {{ c.to }}
          </Tag>
        </div>
      </div>
    </template>
  </Drawer>
</template>
