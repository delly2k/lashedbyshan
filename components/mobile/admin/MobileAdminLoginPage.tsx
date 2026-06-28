import { MobileShell } from '@/components/mobile/shared/MobileShell';
import { AdminLoginFormWithSuspense } from '@/components/shared/admin/AdminLoginForm';
import { Card } from '@/components/shared/ui/Card';
import { Logo } from '@/components/shared/ui/Logo';

export function MobileAdminLoginPage() {
  return (
    <MobileShell showFooter={false}>
      <div className="flex flex-1 flex-col justify-center gap-6 px-5 py-10">
        <div className="text-center">
          <Logo size="lg" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-brand-black">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-brand-black/60">
            For LashedByShan staff only.
          </p>
        </div>

        <Card variant="elevated">
          <AdminLoginFormWithSuspense />
        </Card>
      </div>
    </MobileShell>
  );
}
