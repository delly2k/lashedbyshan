'use client';

import Link from 'next/link';
import { MobileShell } from '@/components/mobile/shared/MobileShell';
import {
  BookingAlert,
  BookingEmptyState,
  BookingLoadingState,
} from '@/components/shared/booking/BookingStates';
import { Button } from '@/components/shared/ui/Button';
import { useServices } from '@/hooks/useCustomerBooking';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';
import { formatPriceJmd } from '@/lib/booking/format';
import { BRAND } from '@/lib/constants/brand';
import { cn } from '@/lib/utils/cn';

const SERVICE_IMAGES: Record<string, string> = {
  'Classic Set': '/classic.png',
  'Hybrid Set': '/hybrid.png',
  'Volume Set': '/volume.png',
  'Mega Volume Set': '/mega.png',
};

export function MobileHomePage() {
  const { services, isLoading, error, reload } = useServices();
  const { ref: servicesRef, isVisible: servicesVisible } =
    useRevealOnScroll<HTMLElement>();

  return (
    <MobileShell className="pb-0">
      <section className="sticky top-0 z-0 w-full">
        <div
          className="relative flex min-h-[calc(100vh-56px)] items-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/hero_bg.png')",
            minHeight: 'calc(100dvh - 56px)',
          }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-pink via-brand-blush to-rose-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-ink/85 via-rose-ink/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-rose-ink/40 to-transparent" />
          <div className="relative z-10 flex w-full flex-col items-start px-6 pb-12 text-left text-white">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#f4d9c4]">
              Luxury lash studio
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white">
              Beautiful lashes
              <span className="mt-1 block font-script text-5xl font-semibold text-[#f4d9c4]">
                booked in minutes
              </span>
            </h1>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              {BRAND.tagline}. Pick a service below and book in minutes.
            </p>
            <Button
              href="/book"
              size="lg"
              className="mt-7 w-fit px-10 bg-rose-ink text-white hover:bg-rose-ink/90"
            >
              Book appointment
            </Button>
            <a
              href={BRAND.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-fit border-b border-[#c89b6e]/70 pb-0.5 text-left text-sm text-white"
            >
              WhatsApp {BRAND.whatsapp}
            </a>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-background">
        <section
          id="services"
          ref={servicesRef}
          className="relative -mt-[4vh] rounded-t-[30px] bg-services-bg pt-12 pb-8 shadow-[0_-20px_40px_rgba(58,35,41,0.14)]"
        >
          <div
            className={cn(
              'px-5 transition-all duration-700 ease-out',
              servicesVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
        <div className="mb-3 flex flex-col items-center text-center">
          <div className="mb-1.25 flex items-center gap-2.5">
            <span className="h-px w-9 bg-rose-gold/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-rose-gold" />
            <span className="h-px w-9 bg-rose-gold/50" />
          </div>
          <h2 className="font-display text-2xl font-semibold text-rose-ink">Services</h2>
          <p className="mt-[0.1875rem] text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-gold">
            Choose your look
          </p>
        </div>

        {isLoading ? (
          <div className="mt-4">
            <BookingLoadingState message="Loading services..." />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex flex-col gap-3">
            <BookingAlert message={error} />
            <Button onClick={() => void reload()} variant="secondary">
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && services.length === 0 ? (
          <div className="mt-4">
            <BookingEmptyState
              title="Services coming soon"
              description="Please check back shortly or message Shan on WhatsApp."
            />
          </div>
        ) : null}

        {!isLoading && !error && services.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/book?serviceId=${encodeURIComponent(service.id)}`}
                className="flex items-center gap-3.5 rounded-2xl border border-rose-gold/20 bg-white p-3 shadow-soft transition active:scale-[0.99]"
              >
                <div
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-cover bg-center"
                  style={
                    SERVICE_IMAGES[service.name]
                      ? {
                          backgroundImage: `url('${SERVICE_IMAGES[service.name]}')`,
                        }
                      : undefined
                  }
                >
                  {!SERVICE_IMAGES[service.name] ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-pink via-brand-blush to-rose-ink/60" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base font-semibold leading-tight text-rose-ink">
                    {service.name}
                  </h3>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-brand-black/55">
                    {service.description}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-gold">
                    {service.duration_minutes} min
                  </p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-2">
                  <span className="whitespace-nowrap font-display text-base font-semibold text-rose-ink">
                    {formatPriceJmd(service.price_jmd)}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-rose-ink px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Book
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="relative mt-6 overflow-hidden rounded-3xl border border-rose-gold/30 bg-white px-6 py-7 text-center shadow-card">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-rose-gold to-brand-blush" />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-rose-gold bg-white text-rose-ink">
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
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-rose-gold">
            Where to find me
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-rose-ink">
            {BRAND.locationLabel}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-rose-ink/60">
            {BRAND.locationPrivacy}
          </p>
          <Link
            href="/book"
            className="mt-4 inline-flex rounded-full border-[1.5px] border-rose-gold bg-white px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-ink transition hover:border-rose-ink hover:bg-rose-ink hover:text-white"
          >
            Book a visit
          </Link>
        </div>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
