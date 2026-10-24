import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BackButton, Field, Heading, InlineLink, PrimaryButton, Screen } from '@/components/ui';

export default function OtpScreen() {
  const [code, setCode] = useState('');

  function verify() {
    if (code.length !== 6) {
      Alert.alert('Enter verification code', 'Type the 6-digit code sent to your work email.');
      return;
    }
    router.push('/(auth)/pending');
  }

  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading
          title="Check your email"
          description="We sent a 6-digit verification code to your work email."
        />
        <Field
          label="Verification code"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={6}
        />
        <View className="mb-6 flex-row items-center justify-center gap-1">
          <Text className="text-[13px] text-muted">Didn't receive a code?</Text>
          <InlineLink label="Resend code" onPress={() => Alert.alert('Code sent', 'A new verification code has been sent to your email.')} />
        </View>
        <PrimaryButton title="Verify email" onPress={verify} />
      </View>
    </Screen>
  );
}
