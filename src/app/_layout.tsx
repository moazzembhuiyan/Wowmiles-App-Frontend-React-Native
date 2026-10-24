import '../../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
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
      </Stack>
    </SafeAreaProvider>
  );
}
