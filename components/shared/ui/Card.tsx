import { cn } from '@/lib/utils/cn';

type CardProps = React.ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'elevated' | 'glass';
};

const variantStyles = {
  default: 'bg-white border border-brand-blush/30',
  elevated: 'bg-white shadow-card border border-brand-blush/20',
  glass: 'bg-white/80 backdrop-blur-md border border-white/60',
};

export function Card({
  variant = 'default',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn('rounded-3xl p-5', variantStyles[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
