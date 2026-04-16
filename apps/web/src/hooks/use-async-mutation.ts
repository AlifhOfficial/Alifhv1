'use client';

import { useCallback, useState } from 'react';

interface UseAsyncMutationOptions<TData, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => Promise<void> | void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
    context: TContext | undefined
  ) => Promise<void> | void;
}

interface MutateCallbacks<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
}

export function useAsyncMutation<TData, TVariables = void, TContext = undefined>({
  mutationFn,
  onMutate,
  onSuccess,
  onError,
  onSettled,
}: UseAsyncMutationOptions<TData, TVariables, TContext>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutateAsync = useCallback(
    async (variables: TVariables, callbacks?: MutateCallbacks<TData, TVariables>) => {
      setIsPending(true);
      setError(null);

      let context: TContext | undefined;

      try {
        setIsSuccess(false);
        context = (await onMutate?.(variables)) as TContext | undefined;
        const data = await mutationFn(variables);
        setIsSuccess(true);
        await onSuccess?.(data, variables, context);
        callbacks?.onSuccess?.(data, variables);
        await onSettled?.(data, null, variables, context);
        return data;
      } catch (caughtError) {
        const nextError = caughtError instanceof Error ? caughtError : new Error('Request failed');
        setError(nextError);
        await onError?.(nextError, variables, context);
        callbacks?.onError?.(nextError, variables);
        await onSettled?.(undefined, nextError, variables, context);
        throw nextError;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn, onError, onMutate, onSettled, onSuccess]
  );

  const mutate = useCallback(
    (variables: TVariables, callbacks?: MutateCallbacks<TData, TVariables>) => {
      void mutateAsync(variables, callbacks);
    },
    [mutateAsync]
  );

  return {
    mutate,
    mutateAsync,
    isPending,
    error,
    isSuccess,
    reset: () => {
      setError(null);
      setIsSuccess(false);
      setIsPending(false);
    },
  };
}
