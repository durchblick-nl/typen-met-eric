"use client";
import { useEffect, type RefObject } from "react";

export function isTrainingKey(
  event: KeyboardEvent,
  scope?: HTMLElement | null,
): boolean {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.key.length !== 1
  )
    return false;
  const target = event.target;
  if (
    target instanceof Element &&
    target.closest(
      'input, textarea, select, [contenteditable="true"], button, a',
    )
  )
    return false;
  const dialog =
    target instanceof Element ? target.closest('[role="dialog"]') : null;
  return !dialog || dialog === scope;
}
interface UseKeyboardOptions {
  onKeyPress: (key: string) => void;
  enabled?: boolean;
  allowedKeys?: string[];
  scope?: RefObject<HTMLElement | null>;
}
export function useKeyboard({
  onKeyPress,
  enabled = true,
  allowedKeys,
  scope,
}: UseKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (
        !isTrainingKey(event, scope?.current) ||
        (allowedKeys && !allowedKeys.includes(event.key.toLowerCase()))
      )
        return;
      event.preventDefault();
      onKeyPress(event.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, allowedKeys, onKeyPress, scope]);
}
