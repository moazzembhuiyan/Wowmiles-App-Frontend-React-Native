import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Award, ArrowLeft } from 'lucide-react-native';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthField, AuthFooter, AuthHero, AuthPasswordField } from '@/components/figma-auth';
import { useToast } from '@/components/toast';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();
  const auth = useAuth();

  async function login() {
    if (submitting) return;
    if (!email.includes('@') || !password) {
      showToast('Unable to log in', 'Enter a valid work email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const route = await auth.login({ email: email.trim().toLowerCase(), password, rememberMe: remember });
      router.replace(route);
    } catch (error) {
      showToast('Unable to log in', error instanceof ApiError ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-[#F7F8FA]">
      <AuthHero className="h-[242px] overflow-hidden px-5 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/onboarding');
            }
          }}
          className="mb-5 h-8 w-8 items-center justify-center rounded-full bg-white/20"
        >
          <ArrowLeft color="white" size={17} />
        </Pressable>
        <View className="mb-2 h-8 w-8 items-center justify-center rounded-[9px] bg-[#FFB91F]">
          <Award color="#171A28" size={17} strokeWidth={2} />
        </View>
        <Text className="text-[21px] font-bold text-white">Welcome back</Text>
      </AuthHero>
      <View className="-mt-4 flex-1 rounded-t-[22px] bg-[#F7F8FA] px-5 pb-3 pt-4">
        <Text className="mb-4 text-[14px] leading-[20px] text-[#737A89]">
          Log in to track your miles and register bookings.
        </Text>
        <AuthField
          label="Work email"
          value={email}
          onChangeText={setEmail}
          placeholder="prosenjit@beverlytravel.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AuthPasswordField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
        />
        <View className="mt-1 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
            onPress={() => setRemember((value) => !value)}
            className="flex-row items-center"
          >
            <View className={`mr-1.5 h-[12px] w-[12px] items-center justify-center rounded-[2px] ${remember ? 'bg-[#39479F]' : 'border border-[#AAB0BD] bg-white'}`}>
              {remember ?               <Text className="text-[10px] font-bold text-white">✓</Text> : null}
            </View>
            <Text className="text-[12px] text-[#626A7A]">Keep me logged in</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/forgot')}>
            <Text className="text-[12px] font-medium text-[#354495]">Forgot password?</Text>
          </Pressable>
        </View>
        <View className="mt-3 flex-row justify-center">
          <Text className="text-[12px] text-[#737A89]">New to WowMiles? </Text>
          <Pressable onPress={() => router.push('/(auth)/signup')}>
            <Text className="text-[12px] font-semibold text-[#354495]">Create an account</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/guest')} className="mt-2 items-center py-1">
          <Text className="text-[12px] font-semibold text-[#354495]">Explore as guest</Text>
        </Pressable>
      </View>
      <AuthFooter
        eyebrow={email ? 'Signing in as' : 'Continue with your account'}
        title={email || 'Beverly Travel Ltd.'}
        buttonLabel={submitting ? 'Logging in' : 'Log in'}
        onPress={() => void login()}
      />
    </View>
  );
}
