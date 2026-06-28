'use client';

import { Suspense, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { BookingAlert } from '@/components/shared/booking/BookingStates';
import { Button } from '@/components/shared/ui/Button';
import { Input } from '@/components/shared/ui/Input';

function AdminLoginForm() {
  const { signIn, isSubmitting, error, unauthorized } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void signIn(email, password);
      }}
    >
      {unauthorized ? (
        <BookingAlert
          message="You do not have admin access to this area."
          variant="info"
        />
      ) : null}
      {error ? <BookingAlert message={error} /> : null}
      <Input
        label="Email"
        type="email"
        placeholder="shan@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
        showPasswordToggle
        required
      />
      <Button size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}

export function AdminLoginFormWithSuspense() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
