import { useStore } from '@tanstack/vue-store';

export * from '@tanstack/vue-store';

export function useSelector<TState, TSelected = TState>(
  store: { state: TState },
  selector?: (state: TState) => TSelected,
) {
  const resolve = selector ?? ((state: TState) => state as unknown as TSelected);
  return useStore(store as any, resolve as any) as ReturnType<
    typeof useStore<TState, TSelected>
  >;
}
