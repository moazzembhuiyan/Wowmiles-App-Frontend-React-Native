import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Plane, Sparkles } from 'lucide-react-native';
import { useState } from 'react';

export function Screen({
  children,
  edges = ['top', 'bottom'],
  scroll = true,
  className = '',
}: {
  children: React.ReactNode;
  edges?: Edge[];
  scroll?: boolean;
  className?: string;
}) {
  return (
    <SafeAreaView edges={edges} className={`w-full max-w-[440px] flex-1 self-center bg-canvas ${className}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow px-5 pb-8"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function BrandMark({ size = 42 }: { size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-2xl bg-brand"
      style={{ width: size, height: size }}
    >
      <Plane color="white" size={size * 0.52} strokeWidth={2.3} />
      <Sparkles
        color="white"
        size={size * 0.23}
        strokeWidth={2}
        style={{ position: 'absolute', top: size * 0.12, right: size * 0.08 }}
      />
    </View>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/onboarding');
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress ?? goBack}
      className="mb-7 h-10 w-10 items-center justify-center rounded-full"
      hitSlop={8}
    >
      <ArrowLeft color="#252B3A" size={22} />
    </Pressable>
  );
}

export function Heading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <View className="mb-7">
      <Text className="text-[28px] font-bold leading-9 text-ink">{title}</Text>
      {description ? (
        <Text className="mt-2 text-[15px] leading-[23px] text-muted">{description}</Text>
      ) : null}
    </View>
  );
}

export function Field({
  label,
  className = '',
  ...props
}: TextInputProps & { label: string; className?: string }) {
  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-2 text-[12px] font-medium text-[#454B59]">{label}</Text>
      <TextInput
        className="h-[50px] rounded-[10px] border border-line bg-white px-3.5 text-[14px] text-ink"
        placeholderTextColor="#A4AAB5"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
}

export function PasswordField({
  label,
  className = '',
  ...props
}: TextInputProps & { label: string; className?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      <Text className="mb-2 text-[12px] font-medium text-[#454B59]">{label}</Text>
      <View className="h-[50px] flex-row items-center rounded-[10px] border border-line bg-white px-3.5">
        <TextInput
          className="h-full flex-1 text-[14px] text-ink"
          placeholderTextColor="#A4AAB5"
          autoCapitalize="none"
          secureTextEntry={!visible}
          {...props}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          onPress={() => setVisible((value) => !value)}
          hitSlop={10}
        >
          {visible ? <EyeOff color="#858C9B" size={18} /> : <Eye color="#858C9B" size={18} />}
        </Pressable>
      </View>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  className = '',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      className={`h-[52px] items-center justify-center rounded-[10px] bg-brand px-4 active:opacity-80 disabled:opacity-50 ${className}`}
    >
      <Text className="text-[15px] font-semibold text-white">{title}</Text>
    </Pressable>
  );
}

export function CheckRow({
  checked,
  onPress,
  children,
}: {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      className="mb-5 flex-row items-start"
    >
      <View
        className={`mr-2 mt-0.5 h-[17px] w-[17px] items-center justify-center rounded-[4px] border ${
          checked ? 'border-brand bg-brand' : 'border-[#B7BDCA] bg-white'
        }`}
      >
        {checked ? <Text className="text-[12px] font-bold leading-[15px] text-white">✓</Text> : null}
      </View>
      <View className="flex-1">{children}</View>
    </Pressable>
  );
}

export function InlineLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link">
      <Text className="text-[13px] font-semibold text-brand">{label}</Text>
    </Pressable>
  );
}
