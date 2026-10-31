import '../../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/toast';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
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
    </SafeAreaProvider>
  );
}
