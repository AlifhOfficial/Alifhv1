import type { Query, QueryClient } from '@tanstack/react-query';

const DEBUG_ENABLED = __DEV__;
const INSTALLED_KEY = '__revvup_mobile_query_debug_installed__';

type QuerySnapshot = {
  status: string;
  fetchStatus: string;
  observers: number;
};

function compactKey(query: Query): string {
  try {
    return JSON.stringify(query.queryKey);
  } catch {
    return String(query.queryHash);
  }
}

export function installQueryDebugLogger(queryClient: QueryClient) {
  if (!DEBUG_ENABLED) return () => {};

  const globalState = globalThis as typeof globalThis & Record<string, unknown>;
  if (globalState[INSTALLED_KEY]) {
    return () => {};
  }
  globalState[INSTALLED_KEY] = true;

  console.log('[QueryDebug] Installed');

  const snapshots = new Map<string, QuerySnapshot>();
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    const query = event.query;
    if (!query) return;

    const key = compactKey(query);
    const next: QuerySnapshot = {
      status: query.state.status,
      fetchStatus: query.state.fetchStatus,
      observers: query.getObserversCount(),
    };
    const previous = snapshots.get(query.queryHash);

    if (
      !previous ||
      previous.status !== next.status ||
      previous.fetchStatus !== next.fetchStatus ||
      previous.observers !== next.observers
    ) {
      const suffix = query.state.error instanceof Error ? ` error="${query.state.error.message}"` : '';
      console.log(
        `[QueryDebug] ${event.type} ${key} status=${next.status} fetch=${next.fetchStatus} observers=${next.observers}${suffix}`
      );
      snapshots.set(query.queryHash, next);
    }

    if (event.type === 'removed') {
      snapshots.delete(query.queryHash);
    }
  });

  return () => {
    unsubscribe();
    delete globalState[INSTALLED_KEY];
  };
}
