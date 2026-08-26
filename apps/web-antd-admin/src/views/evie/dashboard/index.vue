<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { Card, Col, Empty, Row, Spin, Tag, TypographyParagraph } from 'ant-design-vue';

import { getDashboardOverview } from '#/api/evie';
import { $t } from '#/locales';

import { scopeColor, EVIE_PRIMARY, EVIE_RADIUS } from '#/views/evie/_shared/tokens';

defineOptions({ name: 'EvieDashboard' });

const router = useRouter();
const loading = ref(false);
const overview = ref<Awaited<ReturnType<typeof getDashboardOverview>>['overview'] | null>(null);

async function loadOverview() {
  loading.value = true;
  try {
    const res = await getDashboardOverview({ activitiesLimit: 5 });
    overview.value = res.overview;
  } finally {
    loading.value = false;
  }
}

function openDictionary(id?: number) {
  if (!id) return;
  router.push({ path: `/evie/dictionary/dictionaries` }); // 简化：跳到列表，后续详情页可直链
}

function formatTime(iso?: string) {
  if (!iso) return '—';
  return iso.replace('T', ' ').slice(0, 16);
}

onMounted(loadOverview);
</script>

<template>
  <Spin :spinning="loading">
    <div :style="{ padding: '0 4px' }">
      <!-- 4 个工作台卡片：我的词库 / 系统词库 / 全局事件 / 健康度 -->
      <Row :gutter="[16, 16]">
        <!-- 我的词库 -->
        <Col :span="12">
          <Card
            :title="$t('evie.dashboard.myDictionaries')"
            :bordered="false"
            :style="{ borderRadius: EVIE_RADIUS.card }"
          >
            <template v-if="overview?.myDictionaries?.length">
              <div
                v-for="dict in overview.myDictionaries.slice(0, 5)"
                :key="dict.id"
                :style="{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                }"
                @click="openDictionary(dict.id)"
              >
                <div :style="{ flex: 1, fontWeight: 500 }">{{ dict.name }}</div>
                <Tag :color="scopeColor(dict.scope)" :style="{ marginRight: '8px' }">
                  {{ dict.scope }}
                </Tag>
                <span :style="{ color: '#666', fontSize: '13px' }">
                  {{ dict.entryCount }} 词条
                </span>
              </div>
            </template>
            <Empty
              v-else
              :description="$t('evie.dashboard.emptyMyDictionaries')"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </Card>
        </Col>

        <!-- 系统词库 -->
        <Col :span="12">
          <Card
            :title="$t('evie.dashboard.systemDictionaries')"
            :bordered="false"
            :style="{ borderRadius: EVIE_RADIUS.card }"
          >
            <template v-if="overview?.systemDictionaries?.length">
              <div
                v-for="dict in overview.systemDictionaries.slice(0, 5)"
                :key="dict.id"
                :style="{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0',
                }"
              >
                <div :style="{ flex: 1, fontWeight: 500 }">{{ dict.name }}</div>
                <Tag :color="scopeColor(dict.scope)" :style="{ marginRight: '8px' }">
                  {{ dict.scope }}
                </Tag>
                <span :style="{ color: '#666', fontSize: '13px' }">
                  {{ dict.entryCount }} 词条
                </span>
              </div>
            </template>
            <Empty
              v-else
              :description="$t('evie.dashboard.emptySystemDictionaries')"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </Card>
        </Col>

        <!-- 健康度 -->
        <Col :span="12">
          <Card
            :title="$t('evie.dashboard.health')"
            :bordered="false"
            :style="{ borderRadius: EVIE_RADIUS.card }"
          >
            <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }">
              <div>
                <div :style="{ color: '#999', fontSize: '13px' }">
                  {{ $t('evie.dashboard.totalDictionaries') }}
                </div>
                <div :style="{ fontSize: '24px', fontWeight: 600, color: EVIE_PRIMARY, marginTop: '4px' }">
                  {{ overview?.health?.totalDictionaries ?? 0 }}
                </div>
              </div>
              <div>
                <div :style="{ color: '#999', fontSize: '13px' }">
                  {{ $t('evie.dashboard.totalEntries') }}
                </div>
                <div :style="{ fontSize: '24px', fontWeight: 600, color: EVIE_PRIMARY, marginTop: '4px' }">
                  {{ overview?.health?.totalEntries ?? 0 }}
                </div>
              </div>
              <div>
                <div :style="{ color: '#999', fontSize: '13px' }">
                  {{ $t('evie.dashboard.totalRelations') }}
                </div>
                <div :style="{ fontSize: '24px', fontWeight: 600, color: EVIE_PRIMARY, marginTop: '4px' }">
                  {{ overview?.health?.totalRelations ?? 0 }}
                </div>
              </div>
              <div>
                <div :style="{ color: '#999', fontSize: '13px' }">
                  {{ $t('evie.dashboard.unresolvedConflicts') }}
                </div>
                <div
                  :style="{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: (overview?.health?.unresolvedConflicts ?? 0) > 0 ? '#cf1322' : EVIE_PRIMARY,
                    marginTop: '4px',
                  }"
                >
                  {{ overview?.health?.unresolvedConflicts ?? 0 }}
                </div>
              </div>
            </div>
            <TypographyParagraph
              :style="{ marginTop: '16px', color: '#999', fontSize: '12px' }"
            >
              {{ $t('evie.dashboard.healthHint') }}
            </TypographyParagraph>
          </Card>
        </Col>

        <!-- 全局事件 -->
        <Col :span="12">
          <Card
            :title="$t('evie.dashboard.recentActivities')"
            :bordered="false"
            :style="{ borderRadius: EVIE_RADIUS.card }"
          >
            <template v-if="overview?.recentActivities?.length">
              <div
                v-for="act in overview.recentActivities"
                :key="act.id"
                :style="{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }"
              >
                <div :style="{ fontWeight: 500 }">{{ act.title }}</div>
                <div :style="{ color: '#666', fontSize: '12px', marginTop: '2px' }">
                  {{ act.summary || act.type }} · {{ formatTime(act.createdAt) }}
                </div>
              </div>
            </template>
            <Empty
              v-else
              :description="$t('evie.dashboard.emptyActivities')"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
          </Card>
        </Col>
      </Row>
    </div>
  </Spin>
</template>