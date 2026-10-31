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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const showToast = useToast();
  return (
    <AuthFormScreen
      footer={
        <AuthFooter
          eyebrow="Sending to"
          title={email || 'your verified agency email'}
          buttonLabel="Send link"
          onPress={() => {
            if (!email.includes('@')) {
              showToast('Enter a valid email', 'Use the work email registered to your account.');
              return;
            }
            router.push('/(auth)/reset');
          }}
        />
      }
    >
      <View>
        <AuthBackButton />
        <View className="mt-5">
          <AuthHeading
            title="Reset your password"
            description="Enter the email linked to your WowMiles account and we’ll send a reset link."
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
            We only send reset links to verified agency email addresses.
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
