import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';
import { getPendingSignupEmail, resendSignupOtp, verifySignupOtp } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';

export default function OtpScreen() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const showToast = useToast();
  const { setSignedIn } = useAuth();
  const email = getPendingSignupEmail() ?? 'your work email';

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function verify() {
    if (submitting) return;
    if (code.length !== 6) {
      showToast('Enter verification code', 'Type the 6-digit code sent to your work email.');
      return;
    }
    setSubmitting(true);
    try {
      const { user, route } = await verifySignupOtp(code);
      setSignedIn(user);
      router.replace(route);
    } catch (error) {
      showToast('Could not verify', error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    try {
      await resendSignupOtp();
      setCooldown(60);
      showToast('Code sent', 'A new verification code has been sent to your email.', 'success');
    } catch (error) {
      showToast('Could not resend code', error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthFormScreen
      step={3}
      footer={
        <AuthFooter
          eyebrow="Confirm your email"
          title={email}
          buttonLabel="Verify"
          onPress={() => void verify()}
        />
      }
    >
      <View>
        <AuthHeading
          title="Confirm your email"
          description={`We sent a 6-digit code to ${email}. It expires in 10 minutes.`}
        />
        <View className="mb-2 flex-row justify-between">
          {Array.from({ length: 6 }, (_, index) => (
            <View
              key={index}
              className={`h-10 w-[14%] items-center justify-center rounded-[9px] border bg-white ${index === code.length ? 'border-[#39479F]' : 'border-[#E0E3EB]'}`}
            >
              <Text className="text-[16px] font-semibold text-[#252A38]">{code[index] || ''}</Text>
            </View>
          ))}
          <TextInput
            accessibilityLabel="6-digit verification code"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            maxLength={6}
            autoFocus
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 40, opacity: 0.01 }}
          />
        </View>
        <Pressable onPress={() => void resend()} disabled={cooldown > 0} className="self-center py-2">
          <Text className="text-[12px] text-[#747B8B]">
            {cooldown > 0 ? `Resend code in 00:${String(cooldown).padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>
        <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#5685AF]">
          Check your spam folder if it has not arrived within a few minutes.
        </Text>
      </View>
    </AuthFormScreen>
  );
}
