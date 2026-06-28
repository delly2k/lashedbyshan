import { describe, expect, it } from 'vitest';
import { validateServiceInput } from '@/lib/admin/services';

describe('validateServiceInput', () => {
  it('rejects invalid service input', () => {
    expect(() => validateServiceInput({ name: '  ' })).toThrow(
      'Service name is required.',
    );
    expect(() => validateServiceInput({ priceJmd: 0 })).toThrow(
      'Price must be greater than zero.',
    );
    expect(() => validateServiceInput({ durationMinutes: -10 })).toThrow(
      'Duration must be greater than zero.',
    );
    expect(() => validateServiceInput({ bufferMinutes: -1 })).toThrow(
      'Buffer time cannot be negative.',
    );
  });
});
