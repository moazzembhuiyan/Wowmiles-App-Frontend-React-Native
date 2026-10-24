import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BackButton, CheckRow, Field, Heading, InlineLink, PasswordField, PrimaryButton, Screen } from '@/components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  function login() {
    if (!email.includes('@') || !password) {
      Alert.alert('Unable to log in', 'Enter a valid work email and password.');
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading title="Welcome back" description="Log in to track your miles and register bookings." />
        <Field label="Work email" value={email} onChangeText={setEmail} placeholder="you@agency.com" keyboardType="email-address" defaultValue={email} />
        <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />
        <View className="mb-4 flex-row items-center">
          <CheckRow checked={remember} onPress={() => setRemember((value) => !value)}>
            <Text className="text-[12px] leading-[18px]  w-1/2 text-muted">Keep me logged in</Text>
          </CheckRow>
          <View className="-mt-5 w-full !items-start -left-[100px]">
            <InlineLink label="Forgot password?" onPress={() => router.push('/(auth)/forgot')} />
          </View>
        </View>
        <PrimaryButton title="Log in" onPress={login} />
        <View className="mt-5 flex-row items-center justify-center gap-1">
          <Text className="text-[13px] text-muted">New to WowMiles?</Text>
          <InlineLink label="Create an account" onPress={() => router.push('/(auth)/signup')} />
        </View>
      </View>
    </Screen>
  );
}
