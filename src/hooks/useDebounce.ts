import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce high-frequency state changes like search inputs.
 * Avoids expensive re-renders and list re-computations on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
