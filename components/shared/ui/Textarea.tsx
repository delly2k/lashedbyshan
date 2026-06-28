import { cn } from '@/lib/utils/cn';

type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & {
  label?: string;
  error?: string;
};

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label className="flex flex-col gap-2">
      {label ? (
        <span className="text-sm font-medium text-brand-black/70">{label}</span>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-28 rounded-2xl border bg-white px-4 py-3 text-brand-black outline-none transition focus:ring-2',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-brand-blush/40 focus:border-brand-pink focus:ring-brand-pink/20',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-sm text-red-500">{error}</span> : null}
    </label>
  );
}
