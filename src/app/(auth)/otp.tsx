import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';

export default function OtpScreen() {
  const [code, setCode] = useState('');
  const showToast = useToast();

  function verify() {
    if (code.length !== 6) {
      showToast('Enter verification code', 'Type the 6-digit code sent to your work email.');
      return;
    }
    router.push('/(auth)/pending');
  }

  return (
    <AuthFormScreen
      step={3}
      footer={
        <AuthFooter
          eyebrow="Confirm your email"
          title="prosenjit@beverlytravel.com"
          buttonLabel="Verify"
          onPress={verify}
        />
      }
    >
      <View>
        <AuthHeading
          title="Confirm your email"
          description="We sent a 6-digit code to prosenjit@beverlytravel.com. It expires in 10 minutes."
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
        <Pressable
          onPress={() =>
            showToast('Code sent', 'A new verification code has been sent to your email.', 'success')
          }
          className="self-center py-2"
        >
          <Text className="text-[12px] text-[#747B8B]">Resend code in 00:42</Text>
        </Pressable>
        <Text className="mt-1 text-center text-[12px] leading-[18px] text-[#5685AF]">
          Check your spam folder if it has not arrived within a few minutes.
        </Text>
      </View>
    </AuthFormScreen>
  );
}
