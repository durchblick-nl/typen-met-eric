'use client';

import { useEffect, useCallback } from 'react';

interface UseKeyboardOptions {
  onKeyPress: (key: string) => void;
  enabled?: boolean;
  allowedKeys?: string[];
}

export function useKeyboard({
  onKeyPress,
  enabled = true,
  allowedKeys
}: UseKeyboardOptions) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(event.key)) {
      return;
    }

    // Prevent default for space to avoid page scroll
    if (event.key === ' ') {
      event.preventDefault();
    }

    // Get the actual character
    let key = event.key;

    // Handle space
    if (key === ' ') {
      key = ' ';
    }

    // Only allow single characters and space
    if (key.length !== 1) {
      return;
    }

    // Check if key is allowed
    if (allowedKeys && !allowedKeys.includes(key.toLowerCase())) {
      return;
    }

    onKeyPress(key);
  }, [enabled, allowedKeys, onKeyPress]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);
}
