import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';

type HeaderSocialsProps = {
  className?: string;
};

const linkClassName =
  'flex h-9 w-9 items-center justify-center rounded-full border border-rose-gold/35 bg-white text-rose-ink transition hover:-translate-y-0.5 hover:bg-rose-ink hover:text-white';

const iconClassName = 'inline h-[17px] w-[17px]';

export function HeaderSocials({ className }: HeaderSocialsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <a
        href={BRAND.instagramLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className={linkClassName}
      >
        <svg
          viewBox="0 0 24 24"
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={BRAND.tiktokLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        className={linkClassName}
      >
        <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor">
          <path d="M16.5 3c.3 2.1 1.6 3.6 3.5 3.9V9.6c-1.3 0-2.5-.4-3.5-1.1v6.1c0 3.1-2.5 5.4-5.4 5.4S5.7 17.7 5.7 14.6c0-2.9 2.3-5.2 5.2-5.2.3 0 .6 0 .8.1v2.8c-.3-.1-.5-.1-.8-.1-1.4 0-2.5 1.1-2.5 2.4s1.1 2.5 2.5 2.5 2.6-1 2.6-2.6V3h3z" />
        </svg>
      </a>
      <a
        href={BRAND.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className={linkClassName}
      >
        <svg viewBox="0 0 24 24" className={iconClassName} fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c2.2.9 2.2.6 2.6.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
        </svg>
      </a>
    </div>
  );
}
