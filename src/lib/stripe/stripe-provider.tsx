import { StripeProvider } from '@stripe/stripe-react-native';

/** Wraps the app so the Payment Sheet can be used; without a publishable key the app renders unchanged. */
export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) return <>{children}</>;
  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="wowmiles">
      <>{children}</>
    </StripeProvider>
  );
}
