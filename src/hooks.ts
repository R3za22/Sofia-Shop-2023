import { useCallback, useEffect, useState } from 'react';
import { ApiError } from './api/types';

export type AsyncState<T> =
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'ready'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: ApiError };

/** Run an async call whenever `key` changes; `reload` runs it again (for "Try again"). */
export function useAsync<T>(fn: () => Promise<T>, key: string): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    setState({ status: 'loading' });
    fn().then(
      (data) => live && setState({ status: 'ready', data }),
      (e: unknown) => live && setState({ status: 'error', error: e instanceof ApiError ? e : new ApiError('server') }),
    );
    return () => {
      live = false;
    };
    // `key` stands in for everything `fn` closes over.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}
