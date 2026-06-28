'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Service } from '@/lib/booking/types';
import {
  EMPTY_CUSTOMER_FORM,
  hasFormErrors,
  validateCustomerForm,
  type CustomerFormData,
  type CustomerFormErrors,
} from '@/lib/booking/validation';

export type CustomerBookingStep =
  | 'service'
  | 'date'
  | 'time'
  | 'details'
  | 'confirm'
  | 'success';

export type SerializedBookingSlot = {
  startTime: string;
  endTime: string;
  serviceEndTime: string;
  date: string;
  label: string;
};

export type BookingConfirmation = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
};

const STEP_ORDER: CustomerBookingStep[] = [
  'service',
  'date',
  'time',
  'details',
  'confirm',
  'success',
];

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Something went wrong. Please try again.');
  }

  return data as T;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchJson<{ services: Service[] }>(
          '/api/booking/services',
        );
        if (active) {
          setServices(data.services);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load services.',
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchJson<{ services: Service[] }>(
        '/api/booking/services',
      );
      setServices(data.services);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load services.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { services, isLoading, error, reload };
}

export function useCustomerBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState<CustomerBookingStep>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SerializedBookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SerializedBookingSlot | null>(
    null,
  );
  const [details, setDetails] = useState<CustomerFormData>(EMPTY_CUSTOMER_FORM);
  const [fieldErrors, setFieldErrors] = useState<CustomerFormErrors>({});
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );

  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      setIsLoadingServices(true);
      setError(null);

      try {
        const data = await fetchJson<{ services: Service[] }>(
          '/api/booking/services',
        );
        setServices(data.services);

        if (preselectedServiceId) {
          const match = data.services.find(
            (service) => service.id === preselectedServiceId,
          );
          if (match) {
            setSelectedService(match);
            setStep('date');
          }
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load services.',
        );
      } finally {
        setIsLoadingServices(false);
      }
    }

    void loadServices();
  }, [preselectedServiceId]);

  useEffect(() => {
    if (!selectedService || !selectedDate) {
      return;
    }

    const service = selectedService;
    const date = selectedDate;
    let active = true;

    Promise.resolve().then(async () => {
      setIsLoadingSlots(true);
      setError(null);
      setSelectedSlot(null);

      try {
        const data = await fetchJson<{ slots: SerializedBookingSlot[] }>(
          `/api/booking/slots?serviceId=${encodeURIComponent(service.id)}&date=${encodeURIComponent(date)}`,
        );
        if (active) {
          setSlots(data.slots);
        }
      } catch (loadError) {
        if (active) {
          setSlots([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Unable to load available times.',
          );
        }
      } finally {
        if (active) {
          setIsLoadingSlots(false);
        }
      }
    });

    return () => {
      active = false;
    };
  }, [selectedService, selectedDate]);

  const stepIndex = STEP_ORDER.indexOf(step);

  const canContinue = useMemo(() => {
    switch (step) {
      case 'service':
        return selectedService !== null;
      case 'date':
        return selectedDate !== null;
      case 'time':
        return selectedSlot !== null;
      case 'details':
        return !hasFormErrors(validateCustomerForm(details));
      case 'confirm':
        return true;
      default:
        return false;
    }
  }, [step, selectedService, selectedDate, selectedSlot, details]);

  const selectService = useCallback((service: Service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);
  }, []);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError(null);
  }, []);

  const selectSlot = useCallback((slot: SerializedBookingSlot) => {
    setSelectedSlot(slot);
    setError(null);
  }, []);

  const updateDetails = useCallback((updates: Partial<CustomerFormData>) => {
    setDetails((current) => ({ ...current, ...updates }));
    setFieldErrors({});
    setError(null);
  }, []);

  const goToStep = useCallback((nextStep: CustomerBookingStep) => {
    setStep(nextStep);
    setError(null);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'success') {
      router.push('/');
      return;
    }

    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) {
      router.push('/');
      return;
    }

    setStep(STEP_ORDER[currentIndex - 1]);
    setError(null);
  }, [router, step]);

  const goNext = useCallback(() => {
    if (step === 'details') {
      const errors = validateCustomerForm(details);
      setFieldErrors(errors);
      if (hasFormErrors(errors)) {
        return;
      }
    }

    if (!canContinue) {
      return;
    }

    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentIndex + 1]);
    }
  }, [canContinue, details, step]);

  const submitBooking = useCallback(async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      setError('Please complete each step before confirming.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data = await fetchJson<{ appointment: BookingConfirmation }>(
        '/api/booking/appointments',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedService.id,
            date: selectedDate,
            startTime: selectedSlot.startTime,
            customer: details,
          }),
        },
      );

      setConfirmation(data.appointment);
      setStep('success');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit your booking.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [details, selectedDate, selectedService, selectedSlot]);

  const resetBooking = useCallback(() => {
    setStep('service');
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setDetails(EMPTY_CUSTOMER_FORM);
    setFieldErrors({});
    setConfirmation(null);
    setError(null);
    router.push('/book');
  }, [router]);

  return {
    step,
    stepIndex,
    services,
    selectedService,
    selectedDate,
    slots,
    selectedSlot,
    details,
    fieldErrors,
    confirmation,
    isLoadingServices,
    isLoadingSlots,
    isSubmitting,
    error,
    canContinue,
    selectService,
    selectDate,
    selectSlot,
    updateDetails,
    goToStep,
    goBack,
    goNext,
    submitBooking,
    resetBooking,
    setError,
  };
}

export type CustomerBooking = ReturnType<typeof useCustomerBooking>;
