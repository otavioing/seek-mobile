import { useLayoutEffect, useRef } from 'react';

// Invalidate requests from the previous account without remounting descendants
// (in particular the root navigator, whose key is used by queued route actions).
export function useSessionScope(sessionUserId: string | null) {
  const generation = useRef(0);
  useLayoutEffect(() => {
    const version = ++generation.current;
    return () => { generation.current = version + 1; };
  }, [sessionUserId]);
  return generation;
}
