import { useState, useEffect, useCallback } from 'react';
import { usePrototypeStore } from '@/app/store/PrototypeStore';

export type ServiceStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

interface MockServiceOptions {
  delay?: number;
  forceEmpty?: boolean;
}

export function useMockService<T>(
  data: T,
  options: MockServiceOptions = {},
): { status: ServiceStatus; data: T | null; error: string | null; refetch: () => void } {
  const { state: { prototypeSettings } } = usePrototypeStore();
  const { delay = 600 } = options;
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setStatus('loading');
    const actualDelay = prototypeSettings.simulateSlow ? delay * 3 : delay;

    const timer = setTimeout(() => {
      if (prototypeSettings.simulateFailure) {
        setStatus('error');
        return;
      }
      if (prototypeSettings.showEmptyStates || (Array.isArray(data) && data.length === 0)) {
        setStatus('empty');
        return;
      }
      setStatus('success');
    }, actualDelay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, prototypeSettings.simulateSlow, prototypeSettings.simulateFailure, prototypeSettings.showEmptyStates]);

  return {
    status,
    data: status === 'success' ? data : null,
    error: status === 'error' ? 'Simulated API failure — toggle off in Prototype Settings.' : null,
    refetch,
  };
}
