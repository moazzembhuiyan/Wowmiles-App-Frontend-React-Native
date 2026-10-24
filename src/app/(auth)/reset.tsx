import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { BackButton, Field, Heading, PasswordField, PrimaryButton, Screen } from '@/components/ui';

export default function ResetPasswordScreen() {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading title="Reset your password" description="Enter the code from your email and choose a new password." />
        <Field label="Reset code" value={code} onChangeText={setCode} placeholder="6-digit code" keyboardType="number-pad" maxLength={6} />
        <PasswordField label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" />
        <PrimaryButton
          title="Save new password"
          onPress={() => {
            if (code.length !== 6 || password.length < 8) {
              Alert.alert('Check your details', 'Enter the 6-digit code and a password with at least 8 characters.');
              return;
            }
            Alert.alert('Password updated', 'You can now log in with your new password.');
            router.replace('/(auth)/login');
          }}
        />
      </View>
    </Screen>
  );
}
