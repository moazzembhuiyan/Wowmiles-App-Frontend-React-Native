import { ApiError } from './client';

/** The Stripe mobile SDK is native only: cards are added from the iOS and Android app. */
export function addCard(_createSetupIntent: () => Promise<{ clientSecret: string }>): Promise<boolean> {
  return Promise.reject(new ApiError('Adding a card is only available in the mobile app.', 0, 'CARD_ENTRY_UNAVAILABLE'));
}
