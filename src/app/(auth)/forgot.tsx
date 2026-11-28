import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import {
  AuthBackButton,
  AuthField,
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
  AuthStatusBar,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';
import { requestPasswordReset } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  async function sendCode() {
    if (submitting) return;
    if (!email.includes('@')) {
      showToast('Enter a valid email', 'Use the work email registered to your account.');
      return;
    }
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      router.push('/(auth)/reset');
    } catch (error) {
      showToast('Could not send the code', error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormScreen
      footer={
        <AuthFooter
          eyebrow="Sending to"
          title={email || 'your verified agency email'}
          buttonLabel="Send code"
          onPress={() => void sendCode()}
        />
      }
    >
      <View>
        <AuthBackButton />
        <View className="mt-5">
          <AuthHeading
            title="Reset your password"
            description="Enter the email linked to your WowMiles account and we’ll send a 6-digit reset code."
          />
        </View>
        <AuthField
          label="Work email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@agency.com"
          keyboardType="email-address"
        />
        <AuthStatusBar>
          <Text className="text-[12px] leading-[17px] text-[#49729A]">
            We only send reset codes to verified agency email addresses.
          </Text>
        </AuthStatusBar>
        <View className="mt-3 flex-row justify-center">
          <Text className="text-[12px] text-[#747B8B]">Remembered it? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[12px] font-semibold text-[#354495]">Back to log in</Text>
          </Pressable>
        </View>
      </View>
    </AuthFormScreen>
  );
}
