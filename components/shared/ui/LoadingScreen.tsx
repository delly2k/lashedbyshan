import { Logo } from '@/components/shared/ui/Logo';

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-cream via-brand-pink/30 to-brand-blush/40">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-blush border-t-brand-black" />
      </div>
    </div>
  );
}
