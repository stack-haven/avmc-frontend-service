import { computed, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

/**
 * evie 词库上下文 composable。
 * 统一从 URL query (?dictionaryId=N) 读取并写入当前选中的词库 ID，
 * 让用户从工作台 / 字典列表「一键进入」子页面时自动预选。
 *
 * 使用：
 *   const { dictionaryId, dictionaryIdStr, setDictionaryId } = useDictionaryContext();
 *   watch(dictionaryIdStr, (v) => setDictionaryId(v));
 */
export function useDictionaryContext() {
  const route = useRoute();
  const router = useRouter();

  // URL 中的 dictionaryId（字符串形式，Vben 路由 query 都是 string）
  const dictionaryIdStr = computed<string | undefined>(() => {
    const v = route.query.dictionaryId;
    if (v == null) return undefined;
    if (Array.isArray(v)) {
      const first = v[0];
      return first == null ? undefined : String(first);
    }
    return String(v);
  });

  // 数字形式
  const dictionaryId = computed<number | undefined>(() => {
    const s = dictionaryIdStr.value;
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  });

  /**
   * 设置当前选中的 dictionaryId（同时写回 URL query，便于分享与后退）。
   */
  function setDictionaryId(id?: number) {
    const next = { ...route.query };
    if (id && id > 0) {
      next.dictionaryId = String(id);
    } else {
      delete next.dictionaryId;
    }
    router.replace({ query: next });
  }

  return { dictionaryId, dictionaryIdStr, setDictionaryId } as {
    dictionaryId: Ref<number | undefined>;
    dictionaryIdStr: Ref<string | undefined>;
    setDictionaryId: (id?: number) => void;
  };
}