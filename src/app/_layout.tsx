import '../../global.css';

import { useEffect } from 'react';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/toast';
import { queryClient } from '@/lib/api/client';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { PaymentsProvider } from '@/lib/stripe/stripe-provider';

/** Routes a signed-out visitor can open; everything else needs a session. */
const PUBLIC_GROUPS = ['(auth)', 'guest'];

function AuthGuard() {
  const { status } = useAuth();
  const segments = useSegments();
  const navigationReady = !!useRootNavigationState()?.key;
  const group: string | undefined = segments[0];

  useEffect(() => {
    if (!navigationReady || status !== 'signedOut') return;
    if (group !== undefined && !PUBLIC_GROUPS.includes(group)) router.replace('/(auth)/onboarding');
  }, [navigationReady, status, group]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <SafeAreaProvider>
    <PaymentsProvider>
      <ToastProvider>
        <AuthGuard />
        <StatusBar style="dark" />
        <NavigationBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8F9FB' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="miles" />
          <Stack.Screen name="history" />
          <Stack.Screen name="loyalty" />
          <Stack.Screen name="tier-benefits" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="notification-detail" />
          <Stack.Screen name="rewards" />
          <Stack.Screen name="reward-detail" />
          <Stack.Screen name="redeem-confirmation" />
          <Stack.Screen name="voucher" />
          <Stack.Screen name="partners" />
          <Stack.Screen name="redemption-history" />
        </Stack>
      </ToastProvider>
    </PaymentsProvider>
    </SafeAreaProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}
