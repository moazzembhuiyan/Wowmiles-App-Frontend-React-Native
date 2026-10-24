import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { BackButton, Field, Heading, PrimaryButton, Screen } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading title="Forgot password?" description="Enter the work email linked to your account and we'll send you a reset code." />
        <Field label="Work email" value={email} onChangeText={setEmail} placeholder="you@agency.com" keyboardType="email-address" />
        <PrimaryButton
          title="Send reset code"
          onPress={() => {
            if (!email.includes('@')) {
              Alert.alert('Enter a valid email', 'Use the work email registered to your account.');
              return;
            }
            router.push('/(auth)/reset');
          }}
        />
      </View>
    </Screen>
  );
}
