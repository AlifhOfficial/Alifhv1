'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseAsyncQueryOptions<TData> {
  queryFn: (signal?: AbortSignal) => Promise<TData>;
  enabled?: boolean;
  initialData?: TData;
  dependencies?: ReadonlyArray<unknown>;
}

export interface AsyncQueryResult<TData> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isPending: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  refetch: () => Promise<TData | undefined>;
  setData: React.Dispatch<React.SetStateAction<TData | undefined>>;
}

export function useAsyncQuery<TData>({
  queryFn,
  enabled = true,
  initialData,
  dependencies = [],
}: UseAsyncQueryOptions<TData>): AsyncQueryResult<TData> {
  const [data, setData] = useState<TData | undefined>(() => initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const requestIdRef = useRef(0);
  const queryFnRef = useRef(queryFn);

  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);

  const execute = useCallback(async () => {
    if (!enabled) {
      return data;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    setIsFetching(true);
    setError(null);

    try {
      const nextData = await queryFnRef.current(controller.signal);
      if (requestId === requestIdRef.current) {
        setData(nextData);
      }
      return nextData;
    } catch (caughtError) {
      if (requestId === requestIdRef.current) {
        setError(caughtError instanceof Error ? caughtError : new Error('Request failed'));
      }
      return undefined;
    } finally {
      if (requestId === requestIdRef.current) {
        setIsFetching(false);
      }
      controller.abort();
    }
  }, [data, enabled, queryFn]);

  useEffect(() => {
    if (!enabled) {
      setIsFetching(false);
      return;
    }

    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    setIsFetching(true);
    setError(null);

    void queryFnRef.current(controller.signal)
      .then((nextData) => {
        if (requestId === requestIdRef.current) {
          setData(nextData);
        }
      })
      .catch((caughtError) => {
        if (requestId === requestIdRef.current) {
          setError(caughtError instanceof Error ? caughtError : new Error('Request failed'));
        }
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsFetching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [enabled, ...dependencies]);

  const isLoading = useMemo(
    () => enabled && isFetching && data === undefined,
    [data, enabled, isFetching]
  );

  return {
    data,
    error,
    isLoading,
    isPending: isLoading,
    isFetching,
    isRefetching: isFetching && data !== undefined,
    refetch: execute,
    setData,
  };
}
