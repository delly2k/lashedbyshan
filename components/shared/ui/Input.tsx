'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
};

export function Input({
  label,
  error,
  className,
  id,
  type,
  showPasswordToggle = false,
  ...props
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const isPasswordField = type === 'password' && showPasswordToggle;
  const inputType = isPasswordField
    ? passwordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <label className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-brand-black/70">{label}</span>
      ) : null}
      <div className={cn(isPasswordField && 'relative')}>
        <input
          id={inputId}
          type={inputType}
          className={cn(
            'h-12 w-full rounded-2xl border bg-white px-4 text-brand-black outline-none transition focus:ring-2',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-brand-blush/40 focus:border-brand-pink focus:ring-brand-pink/20',
            isPasswordField && 'pr-12',
            className,
          )}
          {...props}
        />
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-black/45 transition hover:text-brand-black"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          >
            {passwordVisible ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A2 2 0 0 0 12 15a2 2 0 0 0 1.42-.58" />
                <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7.5a11.6 11.6 0 0 1-2.08 3.5" />
                <path d="M6.61 6.61A11.6 11.6 0 0 0 1 12.5C2.73 16.39 7 19.5 12 19.5c1.05 0 2.06-.14 3-.4" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M2 12.5C3.73 8.11 8 5 13 5s9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S3.73 16.89 2 12.5z" />
                <circle cx="13" cy="12.5" r="3" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </label>
  );
}
