import { BRAND } from '@/lib/constants/brand';

type IconLinkProps = {
  href: string;
  ariaLabel: string;
  handle: string;
  children: React.ReactNode;
};

function IconLink({ href, ariaLabel, handle, children }: IconLinkProps) {
  return (
    <div className="group relative">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-gold/35 bg-white text-rose-ink transition md:hover:-translate-y-0.5 md:hover:border-rose-ink md:hover:bg-rose-ink md:hover:text-white"
      >
        {children}
      </a>
      <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-rose-ink px-2.5 py-1 text-[11px] text-white opacity-0 md:group-hover:opacity-100">
        {handle}
      </span>
    </div>
  );
}

export function BrandFooter() {
  return (
    <footer className="mt-auto border-t-[3px] border-rose-gold bg-gradient-to-b from-brand-pink/40 to-brand-cream px-5 py-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-black/50">
        Good lashes · Good mood · Good day
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <IconLink
          href={BRAND.instagramLink}
          ariaLabel="Instagram"
          handle={BRAND.instagram}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </IconLink>

        <IconLink
          href={BRAND.tiktokLink}
          ariaLabel="TikTok"
          handle={BRAND.tiktok}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M16.5 3c.3 2.1 1.6 3.6 3.5 3.9V9.6c-1.3 0-2.5-.4-3.5-1.1v6.1c0 3.1-2.5 5.4-5.4 5.4S5.7 17.7 5.7 14.6c0-2.9 2.3-5.2 5.2-5.2.3 0 .6 0 .8.1v2.8c-.3-.1-.5-.1-.8-.1-1.4 0-2.5 1.1-2.5 2.4s1.1 2.5 2.5 2.5 2.6-1 2.6-2.6V3h3z" />
          </svg>
        </IconLink>

        <IconLink
          href={BRAND.whatsappLink}
          ariaLabel="WhatsApp"
          handle={BRAND.whatsapp}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8 1-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c2.2.9 2.2.6 2.6.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z" />
          </svg>
        </IconLink>

        <IconLink
          href={BRAND.locationLink}
          ariaLabel="Location"
          handle={BRAND.locationLabel}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
            <circle cx="12" cy="11" r="2.2" />
          </svg>
        </IconLink>
      </div>
    </footer>
  );
}
