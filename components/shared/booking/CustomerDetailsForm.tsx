import type { CustomerFormData, CustomerFormErrors } from '@/lib/booking/validation';
import { Input } from '@/components/shared/ui/Input';
import { Textarea } from '@/components/shared/ui/Textarea';

type CustomerDetailsFormProps = {
  values: CustomerFormData;
  errors: CustomerFormErrors;
  onChange: (updates: Partial<CustomerFormData>) => void;
};

export function CustomerDetailsForm({
  values,
  errors,
  onChange,
}: CustomerDetailsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Full name"
        placeholder="Your name"
        value={values.name}
        error={errors.name}
        onChange={(event) => onChange({ name: event.target.value })}
        autoComplete="name"
        required
      />
      <Input
        label="Phone number"
        placeholder="876-000-0000"
        value={values.phone}
        error={errors.phone}
        onChange={(event) => onChange({ phone: event.target.value })}
        autoComplete="tel"
        inputMode="tel"
        required
      />
      <Input
        label="Instagram handle (optional)"
        placeholder="@yourhandle"
        value={values.instagram}
        error={errors.instagram}
        onChange={(event) => onChange({ instagram: event.target.value })}
      />
      <Textarea
        label="Notes (optional)"
        placeholder="Any requests or allergies..."
        value={values.notes}
        error={errors.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
      />
    </div>
  );
}
