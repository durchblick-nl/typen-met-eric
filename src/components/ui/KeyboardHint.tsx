'use client';

interface KeyboardHintProps {
  keyName: string;
  className?: string;
}

export function KeyboardHint({ keyName, className = '' }: KeyboardHintProps) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 ml-2 text-xs font-mono font-bold rounded border bg-white/20 border-white/30 text-white/90 ${className}`}
    >
      {keyName}
    </span>
  );
}

export function KeyboardHintDark({ keyName, className = '' }: KeyboardHintProps) {
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 ml-2 text-xs font-mono font-bold rounded border bg-gray-100 border-gray-300 text-gray-600 ${className}`}
    >
      {keyName}
    </span>
  );
}
