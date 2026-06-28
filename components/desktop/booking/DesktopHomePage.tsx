'use client';

import Link from 'next/link';
import { DesktopShell } from '@/components/desktop/shared/DesktopShell';
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

export function DesktopHomePage() {
  const { services, isLoading, error, reload } = useServices();
  const { ref: servicesRef, isVisible: servicesVisible } =
    useRevealOnScroll<HTMLElement>();

  return (
    <DesktopShell className="pt-0 pb-0">
      <section className="sticky top-0 z-0 w-full">
        <div
          className="relative flex min-h-[calc(100dvh-6rem+6vh)] items-center overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero_bg.png')" }}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-pink via-brand-blush to-rose-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-ink/60 via-rose-ink/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-rose-ink/55 to-transparent" />
          <div className="relative z-10 flex max-w-2xl flex-col items-center px-[6vw] text-center text-white">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#f4d9c4]">
              Luxury lash studio
            </p>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-white lg:text-6xl">
              Beautiful lashes
              <span className="mt-1 block font-script text-6xl font-semibold text-[#f4d9c4] lg:text-7xl">
                booked in minutes
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-white/85">
              {BRAND.tagline}. Pick a service below and book in minutes.
            </p>
            <div className="mt-8 flex items-center justify-center gap-5">
              <Button
                href="/book"
                size="lg"
                className="bg-rose-ink text-white hover:bg-rose-ink/90"
              >
                Book appointment
              </Button>
              <a
                href={BRAND.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-[#c89b6e]/70 pb-0.5 text-sm text-white hover:text-white/80"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        <section
          id="services"
          ref={servicesRef}
          className="relative -mt-[6vh] rounded-t-[42px] bg-services-bg pt-16 pb-10 shadow-[0_-24px_50px_rgba(58,35,41,0.16)]"
        >
          <div
            className={cn(
              'mx-auto max-w-6xl px-8 transition-all duration-700 ease-out',
              servicesVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
            )}
          >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-1.5 flex items-center gap-3">
            <span className="h-px w-12 bg-rose-gold/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-rose-gold" />
            <span className="h-px w-12 bg-rose-gold/50" />
          </div>
          <h2 className="font-display text-4xl font-semibold text-rose-ink">Services</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.34em] text-rose-gold">
            Choose your look
          </p>
        </div>

        {isLoading ? (
          <div className="text-center">
            <BookingLoadingState message="Loading services..." />
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-col items-center gap-3">
            <BookingAlert message={error} />
            <Button onClick={() => void reload()} variant="secondary">
              Try again
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && services.length === 0 ? (
          <BookingEmptyState
            title="Services coming soon"
            description="Please check back shortly or message Shan on WhatsApp."
          />
        ) : null}

        {!isLoading && !error && services.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/book?serviceId=${encodeURIComponent(service.id)}`}
                className="group cursor-pointer rounded-md border border-rose-gold/30 bg-white p-2.5 shadow-card transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(168,122,94,0.22)]"
              >
                <div className="flex flex-col items-center rounded-sm border border-rose-gold p-3.5 text-center">
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-cover bg-center"
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
                  <h3 className="mt-4 font-display text-lg font-semibold text-rose-ink">
                    {service.name}
                  </h3>
                  <p className="mt-2 min-h-[38px] text-[13px] leading-relaxed text-brand-black/55">
                    {service.description}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-gold">
                    {service.duration_minutes} min
                  </p>
                  <span className="mt-2.5 inline-flex rounded-full border-[1.5px] border-rose-gold bg-white px-4 py-1.5 font-display text-base font-semibold text-rose-ink">
                    {formatPriceJmd(service.price_jmd)}
                  </span>
                  <span className="mt-4 rounded-full bg-rose-ink px-7 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_6px_16px_rgba(58,35,41,0.22)] transition group-hover:bg-rose-gold">
                    Book now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="relative mt-8 flex items-center gap-7 overflow-hidden rounded-3xl border border-rose-gold/30 bg-white px-9 py-8 shadow-card">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-rose-gold to-brand-blush" />
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-rose-gold bg-white text-rose-ink shadow-[0_6px_16px_rgba(200,155,110,0.22)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.24em] text-rose-gold">
              Where to find me
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-rose-ink">
              {BRAND.locationLabel}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rose-ink/60">
              {BRAND.locationPrivacy}
            </p>
          </div>
          <Link
            href="/book"
            className="flex-shrink-0 rounded-full border-[1.5px] border-rose-gold bg-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-ink transition hover:border-rose-ink hover:bg-rose-ink hover:text-white"
          >
            Book a visit
          </Link>
        </div>
          </div>
        </section>
      </div>
    </DesktopShell>
  );
}
