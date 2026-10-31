import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { AuthField, AuthFooter, AuthFormScreen, AuthHeading, AuthPasswordField } from '@/components/figma-auth';
import { useToast } from '@/components/toast';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(true);
  const showToast = useToast();

  function createAccount() {
    if (!name.trim() || !email.includes('@') || phone.trim().length < 6 || password.length < 8) {
      showToast('Check your details', 'Enter your name, a valid email, phone number and a password with at least 8 characters.');
      return;
    }
    if (!accepted) {
      showToast('Terms required', 'Please agree to the program terms and privacy policy to continue.');
      return;
    }
    router.push('/(auth)/agency');
  }

  return (
    <AuthFormScreen
      step={1}
      footer={
        <AuthFooter
          eyebrow="Next"
          title="Verify your agency"
          buttonLabel="Continue"
          onPress={createAccount}
        />
      }
    >
      <View>
        <AuthHeading
          title="Create your account"
          description="Join the Beverly Group travel consultant network."
        />
        <AuthField label="Full name" value={name} onChangeText={setName} placeholder="Your full name" autoCapitalize="words" />
        <AuthField label="Work email" value={email} onChangeText={setEmail} placeholder="you@agency.com" keyboardType="email-address" />
        <AuthField label="Mobile number" value={phone} onChangeText={setPhone} placeholder="+880 1XXX XXXXXX" keyboardType="phone-pad" />
        <AuthPasswordField label="Password" value={password} onChangeText={setPassword} placeholder="Password" />
        <Text className="-mt-1 mb-3 text-[12px] text-[#368A68]">Strong password</Text>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: accepted }}
          onPress={() => setAccepted((value) => !value)}
          className="mb-2 flex-row items-start"
        >
          <View className={`mr-2 mt-0.5 h-[16px] w-[16px] items-center justify-center rounded-[3px] ${accepted ? 'bg-[#39479F]' : 'border border-[#AAB0BD] bg-white'}`}>
            {accepted ? <Text className="text-[10px] font-bold text-white">✓</Text> : null}
          </View>
          <Text className="flex-1 text-[12px] leading-[18px] text-[#737A89]">
            I agree to the WowMiles Programme Terms and the Beverly Group Privacy Policy.
          </Text>
        </Pressable>
        <View className="mt-1 flex-row justify-center">
          <Text className="text-[12px] text-[#737A89]">Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[12px] font-semibold text-[#354495]">Log in</Text>
          </Pressable>
        </View>
      </View>
    </AuthFormScreen>
  );
}
