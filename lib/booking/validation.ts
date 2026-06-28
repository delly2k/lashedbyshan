export type CustomerFormData = {
  name: string;
  phone: string;
  instagram: string;
  notes: string;
};

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormData, string>
>;

export const EMPTY_CUSTOMER_FORM: CustomerFormData = {
  name: '',
  phone: '',
  instagram: '',
  notes: '',
};

export function validateCustomerForm(
  data: CustomerFormData,
): CustomerFormErrors {
  const errors: CustomerFormErrors = {};

  const name = data.name.trim();
  const phone = data.phone.trim();

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (!/^[\d\s+\-()]{7,20}$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  return errors;
}

export function hasFormErrors(errors: CustomerFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
