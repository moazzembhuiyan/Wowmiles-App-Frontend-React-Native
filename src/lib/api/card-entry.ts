import { initPaymentSheet, PaymentSheetError, presentPaymentSheet } from '@stripe/stripe-react-native';
import { ApiError } from './client';

/**
 * Collects a card with the Stripe Payment Sheet in setup mode. The card details go to Stripe directly; the backend
 * only creates the SetupIntent. Resolves true when the card was saved, false when the sheet was dismissed.
 */
export async function addCard(createSetupIntent: () => Promise<{ clientSecret: string }>): Promise<boolean> {
  if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new ApiError('Card entry is not configured for this build.', 0, 'CONFIG');
  }
  const { clientSecret } = await createSetupIntent();
  const init = await initPaymentSheet({
    merchantDisplayName: 'WowMiles',
    setupIntentClientSecret: clientSecret,
    returnURL: 'wowmiles://stripe-redirect',
  });
  if (init.error) throw new ApiError(init.error.message, 0, 'CARD_ENTRY');
  const result = await presentPaymentSheet();
  if (!result.error) return true;
  if (result.error.code === PaymentSheetError.Canceled) return false;
  throw new ApiError(result.error.message, 0, 'CARD_ENTRY');
}
