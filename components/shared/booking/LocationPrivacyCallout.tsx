import { BRAND } from '@/lib/constants/brand';

type LocationPrivacyCalloutProps = {
  className?: string;
  centered?: boolean;
};

export function LocationPrivacyCallout({
  className = '',
  centered = false,
}: LocationPrivacyCalloutProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rose-gold/30 bg-gradient-to-br from-brand-pink/30 via-brand-cream to-white p-4 shadow-soft ${className}`}
    >
      <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-rose-gold to-brand-blush" />
      <div
        className={`flex gap-3.5 ${centered ? 'flex-col items-center text-center' : 'items-start'}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-gold/40 bg-white text-rose-ink shadow-[0_4px_12px_rgba(200,155,110,0.15)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
            <circle cx="12" cy="11" r="2.2" />
          </svg>
        </div>
        <div className={centered ? 'max-w-sm' : 'min-w-0 flex-1'}>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-gold">
            Private studio
          </p>
          <p className="mt-1 font-display text-base font-semibold text-rose-ink">
            {BRAND.locationLabel}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-brand-black/65">
            {BRAND.locationPrivacy}
          </p>
        </div>
      </div>
    </div>
  );
}
