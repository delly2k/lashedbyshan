import type { Service } from '@/lib/booking/types';
import { formatPriceJmd } from '@/lib/booking/format';
import { Card } from '@/components/shared/ui/Card';
import { cn } from '@/lib/utils/cn';

type ServicePickerProps = {
  services: Service[];
  selectedServiceId?: string | null;
  onSelect: (service: Service) => void;
  variant?: 'mobile' | 'desktop';
};

export function ServicePicker({
  services,
  selectedServiceId,
  onSelect,
  variant = 'mobile',
}: ServicePickerProps) {
  if (services.length === 0) {
    return null;
  }

  if (variant === 'desktop') {
    return (
      <div className="flex flex-col gap-3">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              className={cn(
                'rounded-2xl border p-4 text-left transition',
                isSelected
                  ? 'border-brand-blush bg-brand-cream ring-2 ring-brand-blush/60'
                  : 'border-brand-blush/30 bg-white hover:bg-brand-cream/50',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-brand-black">{service.name}</h3>
                  <p className="mt-1 text-sm text-brand-black/60">
                    {service.description}
                  </p>
                  <p className="mt-2 text-sm text-brand-black/50">
                    {service.duration_minutes} min
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {formatPriceJmd(service.price_jmd)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;

        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className="text-left"
          >
            <Card
              variant={isSelected ? 'elevated' : 'default'}
              className={cn(
                'transition',
                isSelected ? 'ring-2 ring-brand-blush' : 'hover:bg-brand-cream/40',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-brand-black">{service.name}</h3>
                  <p className="mt-1 text-sm text-brand-black/60">
                    {service.description}
                  </p>
                  <p className="mt-2 text-sm text-brand-black/50">
                    {service.duration_minutes} min
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-cream px-3 py-1 text-sm font-medium">
                  {formatPriceJmd(service.price_jmd)}
                </span>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}

export function ServiceSummaryCard({ service }: { service: Service }) {
  return (
    <Card variant="glass" className="p-4">
      <p className="text-xs uppercase tracking-wide text-brand-black/45">
        Selected service
      </p>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-brand-black">{service.name}</h3>
          <p className="mt-1 text-sm text-brand-black/60">
            {service.duration_minutes} min
          </p>
        </div>
        <span className="font-medium">{formatPriceJmd(service.price_jmd)}</span>
      </div>
    </Card>
  );
}
