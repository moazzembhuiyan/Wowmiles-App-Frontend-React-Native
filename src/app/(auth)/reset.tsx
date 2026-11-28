import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import {
  AuthBackButton,
  AuthField,
  AuthFooter,
  AuthFormScreen,
  AuthHeading,
  AuthPasswordField,
} from '@/components/figma-auth';
import { useToast } from '@/components/toast';
import { resetPasswordWithCode } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  async function savePassword() {
    if (submitting) return;
    if (code.length !== 6 || password.length < 8 || password !== confirmPassword) {
      showToast('Check your details', 'Enter the 6-digit code, use a password with at least 8 characters, and confirm it correctly.');
      return;
    }
    setSubmitting(true);
    try {
      await resetPasswordWithCode({ code, password, confirmPassword });
      showToast('Password updated', 'You can now log in with your new password.', 'success');
      router.replace('/(auth)/login');
    } catch (error) {
      showToast('Could not reset password', error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthFormScreen
      footer={
        <AuthFooter
          eyebrow="Then"
          title="Log in with it"
          buttonLabel="Save"
          onPress={() => void savePassword()}
        />
      }
    >
      <View>
        <AuthBackButton />
        <View className="mt-5">
          <AuthHeading
            title="Create a new password"
            description="Choose something new you haven’t used before."
          />
        </View>
        <AuthField
          label="Reset code"
          value={code}
          onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
          placeholder="6-digit code"
          keyboardType="number-pad"
          maxLength={6}
        />
        <AuthPasswordField
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
        />
        <AuthPasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
        />
      </View>
    </AuthFormScreen>
  );
}
