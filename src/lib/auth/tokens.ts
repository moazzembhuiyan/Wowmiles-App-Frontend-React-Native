import * as SecureStore from 'expo-secure-store';

/** Session tokens live in the platform keystore (expo-secure-store), never in AsyncStorage. */
export type Tokens = { accessToken: string; refreshToken: string };

const KEY = 'wowmiles.session';

let cache: Tokens | null = null;
let loaded = false;

function isTokens(value: unknown): value is Tokens {
  const v = value as Partial<Tokens> | null;
  return !!v && typeof v.accessToken === 'string' && typeof v.refreshToken === 'string';
}

/** Reads the stored tokens once, then serves them from memory. */
export async function loadTokens(): Promise<Tokens | null> {
  if (loaded) return cache;
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    cache = isTokens(parsed) ? parsed : null;
  } catch {
    // Keystore unavailable (for example on web): the session lasts for this run only.
    cache = null;
  }
  loaded = true;
  return cache;
}

export function getTokens(): Tokens | null {
  return cache;
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  cache = tokens;
  loaded = true;
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
  } catch {
    // Keep the in-memory session when the keystore is unavailable.
  }
}

export async function clearTokens(): Promise<void> {
  cache = null;
  loaded = true;
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {
    // Nothing stored.
  }
}
