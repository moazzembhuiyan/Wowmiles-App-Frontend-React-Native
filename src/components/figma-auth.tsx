import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  ink: '#171A28',
  muted: '#747B8B',
  blue: '#33439E',
  gold: '#FFB91F',
};

export function AuthFormScreen({
  step,
  children,
  footer,
}: {
  step?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      className="w-full max-w-[440px] flex-1 self-center bg-[#F8F9FB]"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step ? <AuthStepHeader step={step} /> : null}
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthStepHeader({ step }: { step: number }) {
  return (
    <View className="mb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <AuthBackButton />
        <Text className="text-[13px] text-[#747B8B]">Step {step} of 3</Text>
      </View>
      <View className="h-[2px] flex-row bg-[#E4E7EF]">
        <View className="h-[2px] bg-[#39479F]" style={{ width: `${(step / 3) * 100}%` }} />
      </View>
    </View>
  );
}

export function AuthBackButton() {
  return (
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
      className="h-10 w-10 items-center justify-center rounded-full bg-white"
      hitSlop={8}
    >
      <ArrowLeft color={colors.ink} size={21} />
    </Pressable>
  );
}

export function AuthField({
  label,
  className = '',
  ...props
}: TextInputProps & { label: string; className?: string }) {
  return (
    <View className={`mb-4 ${className}`}>
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor="#8990A0"
        autoCapitalize="none"
        className="h-[48px] rounded-[11px] border border-[#DDE1EA] bg-white px-3.5 text-[15px] text-[#252A38]"
        {...props}
      />
      {props.value ? (
        <Text className="mt-1 text-[12px] leading-[18px] text-[#555D6E]">{label}</Text>
      ) : null}
    </View>
  );
}

export function AuthPasswordField({
  label,
  className = '',
  ...props
}: TextInputProps & { label: string; className?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      <View className="h-[48px] flex-row items-center rounded-[11px] border border-[#39479F] bg-white px-3.5">
        <TextInput
          accessibilityLabel={label}
          placeholder={label}
          placeholderTextColor="#8990A0"
          autoCapitalize="none"
          secureTextEntry={!visible}
          className="h-full flex-1 text-[15px] text-[#252A38]"
          {...props}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((current) => !current)}
          hitSlop={10}
        >
          {visible ? <EyeOff color="#798093" size={18} /> : <Eye color="#798093" size={18} />}
        </Pressable>
      </View>
      {props.value ? (
        <Text className="mt-1 text-[12px] leading-[18px] text-[#555D6E]">{label}</Text>
      ) : null}
    </View>
  );
}

export function AuthFooter({
  eyebrow,
  title,
  buttonLabel,
  onPress,
}: {
  eyebrow: string;
  title: string;
  buttonLabel: string;
  onPress: () => void;
}) {
  return (
    <View className="mx-5 mb-2 min-h-[64px] flex-row items-center rounded-full bg-[#111522] pl-4 pr-1.5">
      <View className="flex-1 pr-2">
        <Text numberOfLines={1} className="text-[12px] text-[#B9BDCA]">{eyebrow}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[13px] font-medium text-white">{title}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="min-w-[84px] items-center justify-center rounded-full bg-[#FFB91F] px-4 py-[12px] active:opacity-80"
      >
        <Text className="text-[13px] font-semibold text-[#171A28]">{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

export function AuthHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View className="mb-4">
      <Text className="text-[21px] font-bold leading-[26px] text-[#191C28]">{title}</Text>
      <Text className="mt-1.5 text-[13px] leading-[19px] text-[#737A89]">{description}</Text>
    </View>
  );
}

export function AuthHero({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`relative ${className}`}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#11184F', '#29368F', '#454DC2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" className="absolute -right-7 -top-[65px] h-[300px] w-[300px] rounded-full border border-white/10" />
      <View pointerEvents="none" className="absolute -right-5 -top-[60px] h-[250px] w-[250px] rounded-full border border-white/10" />
      {children}
    </View>
  );
}

export function AuthStatusBar({ children }: { children: React.ReactNode }) {
  return <View className="rounded-[14px] bg-[#EDF7FF] px-3 py-2">{children}</View>;
}
