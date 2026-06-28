import Image from 'next/image';
import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';

type LogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
};

const sizeStyles = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-16',
};

export function Logo({ className, size = 'md', priority = false }: LogoProps) {
  return (
    <Image
      src="/lashedbyshan.png"
      alt={BRAND.name}
      width={1280}
      height={500}
      priority={priority}
      className={cn('w-fit max-w-full shrink-0 object-contain', sizeStyles[size], className)}
    />
  );
}
