import { AdminLoginFormWithSuspense } from '@/components/shared/admin/AdminLoginForm';
import { Button } from '@/components/shared/ui/Button';
import { Card } from '@/components/shared/ui/Card';
import { Logo } from '@/components/shared/ui/Logo';

export function DesktopAdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-cream via-white to-brand-blush/30 px-8">
      <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <section className="hidden lg:block">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-4xl font-semibold text-brand-black">
            Admin portal
          </h1>
          <p className="mt-4 max-w-md text-lg text-brand-black/60">
            Manage appointments, confirm bookings, and keep your lash schedule
            organized.
          </p>
        </section>

        <Card variant="elevated" className="p-8">
          <div className="lg:hidden">
            <Logo size="md" />
            <h1 className="mt-4 font-display text-2xl font-semibold text-brand-black">
              Admin sign in
            </h1>
          </div>
          <div className="mt-6">
            <AdminLoginFormWithSuspense />
          </div>
          <div className="mt-6">
            <Button href="/" variant="ghost" className="w-full">
              Back to booking site
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
