import { useState } from 'react';
import { router } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BackButton, CheckRow, Field, Heading, InlineLink, PasswordField, PrimaryButton, Screen } from '@/components/ui';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(true);

  function createAccount() {
    if (!name.trim() || !email.includes('@') || phone.trim().length < 6 || password.length < 8) {
      Alert.alert('Check your details', 'Enter your name, a valid email, phone number and a password with at least 8 characters.');
      return;
    }
    if (!accepted) {
      Alert.alert('Terms required', 'Please agree to the program terms and privacy policy to continue.');
      return;
    }
    router.push('/(auth)/agency');
  }

  return (
    <Screen>
      <View className="pt-2">
        <BackButton />
        <Heading
          title="Create your account"
          description="Join the Beverly Group travel consultant network."
        />
        <Field label="Full name" value={name} onChangeText={setName} placeholder="Your full name" autoCapitalize="words" />
        <Field label="Work email" value={email} onChangeText={setEmail} placeholder="you@agency.com" keyboardType="email-address" />
        <Field label="Mobile number" value={phone} onChangeText={setPhone} placeholder="+880 1XXX XXXXXX" keyboardType="phone-pad" />
        <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" />
        <Text className="-mt-2 mb-4 text-[11px] text-muted">At least 8 characters with one number</Text>
        <CheckRow checked={accepted} onPress={() => setAccepted((value) => !value)}>
          <Text className="text-[12px] leading-[18px] text-muted">
            I agree to the WowMiles Program Terms and the Beverly Group Privacy Policy.
          </Text>
        </CheckRow>
        <PrimaryButton title="Continue" onPress={createAccount} />
        <View className="mt-5 flex-row items-center justify-center gap-1">
          <Text className="text-[13px] text-muted">Already have an account?</Text>
          <InlineLink label="Log in" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}
