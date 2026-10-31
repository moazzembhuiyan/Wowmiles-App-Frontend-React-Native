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

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const showToast = useToast();

  function savePassword() {
    if (code.length !== 6 || password.length < 8 || password !== confirmPassword) {
      showToast('Check your details', 'Enter the 6-digit code, use a password with at least 8 characters, and confirm it correctly.');
      return;
    }
    showToast('Password updated', 'You can now log in with your new password.', 'success');
    router.replace('/(auth)/login');
  }

  return (
    <AuthFormScreen
      footer={
        <AuthFooter
          eyebrow="Then"
          title="We will sign you in"
          buttonLabel="Save"
          onPress={savePassword}
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
