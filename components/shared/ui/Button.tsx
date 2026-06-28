import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

const variantStyles = {
  primary:
    'bg-brand-black text-white shadow-soft hover:bg-brand-black/90 active:scale-[0.98]',
  secondary:
    'bg-white text-brand-black border border-brand-blush/60 shadow-soft hover:bg-brand-cream',
  ghost: 'bg-transparent text-brand-black hover:bg-brand-blush/20',
};

const sizeStyles = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-base font-medium',
};

export function Button({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
