import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Award, Check, ChevronRight, CircleCheck, LockKeyhole, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const academyColors = {
  ink: '#202638',
  muted: '#747C8D',
  blue: '#4145B6',
  navy: '#111522',
  canvas: '#4145B6',
  line: '#E8EAF0',
  yellow: '#FFB91F',
  green: '#0A8E5B',
  white: '#FFFFFF',
};

export function AcademyScreenFrame({
  children,
  background = academyColors.canvas,
  bgColor = academyColors.white,
}: {
  children: ReactNode;
  background?: string;
  bgColor?: string; 
}) {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: background }}>
      <View className="w-full max-w-[440px] flex-1 self-center" style={{ backgroundColor: bgColor }}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export function OrbitRings({ color = 'rgba(255,255,255,0.12)' }: { color?: string }) {
  return (
    <View pointerEvents="none" className="absolute -right-[56px] -top-[56px] h-[225px] w-[225px] items-center justify-center">
      {[225, 180, 138, 96].map((size) => (
        <View
          key={size}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: color,
          }}
        />
      ))}
    </View>
  );
}

export function AcademyGradient({
  children,
  colors = ['#252B77', '#555DCB'],
  className = '',
  style,
}: {
  children: ReactNode;
  colors?: readonly [string, string, ...string[]];
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={`overflow-hidden ${className}`}
      style={style}
    >
      <OrbitRings />
      {children}
    </LinearGradient>
  );
}

export function RoundIconButton({
  label,
  onPress,
  icon = 'back',
  light = false,
}: {
  label: string;
  onPress: () => void;
  icon?: 'back' | 'close';
  light?: boolean;
}) {
  const Icon = icon === 'close' ? X : ArrowLeft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className={`h-10 w-10 items-center justify-center rounded-full ${light ? 'bg-white/15' : 'bg-white'}`}
    >
      <Icon color={light ? '#FFFFFF' : academyColors.ink} size={19} />
    </Pressable>
  );
}

export function AcademyEyebrow({ children, light = false, style }: { children: ReactNode; light?: boolean; style?: StyleProp<TextStyle> }) {
  return (
    <Text className={`text-[12px] font-semibold tracking-[1px] ${light ? 'text-white/75' : 'text-[#737B8A]'}`} style={style}>
      {children}
    </Text>
  );
}

export function AcademyActionBar({
  eyebrow,
  title,
  actionLabel,
  onPress,
  disabled = false,
  onSecondary,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onPress: () => void;
  disabled?: boolean;
  onSecondary?: () => void;
  secondaryLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
      <View className="min-h-[58px] flex-row items-center rounded-full bg-[#111522] px-3 py-2">
        <View className="flex-1 pr-2">
          <Text className="text-[12px] text-white/55">{eyebrow}</Text>
          <Text numberOfLines={1} className="mt-0.5 text-[14px] font-medium text-white">{title}</Text>
        </View>
        {onSecondary && secondaryLabel ? (
          <Pressable accessibilityRole="button" onPress={onSecondary} className="mr-2 px-2 py-2">
            <Text className="text-[14px] font-medium text-white">{secondaryLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onPress}
          className={`min-w-[78px] items-center justify-center rounded-full px-4 py-[11px] ${disabled ? 'bg-[#737782]' : 'bg-[#FFB91F]'}`}
        >
          <Text className="text-[14px] font-bold text-[#171923]">{actionLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function ModuleProgressRow({
  title,
  subtitle,
  state,
  onPress,
}: {
  title: string;
  subtitle: string;
  state: 'complete' | 'current' | 'locked';
  onPress?: () => void;
}) {
  const icon = state === 'complete'
    ? <Check color="#FFFFFF" size={12} strokeWidth={3} />
    : state === 'current'
      ? <CircleCheck color="#FFFFFF" size={13} />
      : <LockKeyhole color="#8C94A3" size={12} />;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="min-h-[48px] flex-row items-center border-b border-[#E8EAF0] py-2"
    >
      <View className={`mr-3 h-[22px] w-[22px] items-center justify-center rounded-full ${
        state === 'complete' ? 'bg-[#20C880]' : state === 'current' ? 'bg-[#4145B6]' : 'bg-transparent'
      }`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[12px] font-medium text-[#273042]">{title}</Text>
        <Text className="mt-0.5 text-[9px] text-[#858C99]">{subtitle}</Text>
      </View>
      {state === 'current' ? <ChevronRight color={academyColors.blue} size={16} /> : null}
    </Pressable>
  );
}

export function AcademyPillTabs({
  tabs,
  selected,
  onSelect,
}: {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      {tabs.map((tab) => {
        const active = selected === tab;
        return (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab)}
            className={`rounded-full px-3 py-2 ${active ? 'bg-[#4145B6]' : 'border border-[#E5E7ED] bg-white'}`}
          >
            <Text className={`text-[13px] font-medium ${active ? 'text-white' : 'text-[#545C6D]'}`}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ScrollContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function CertificateSeal() {
  return (
    <View className="h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FFB91F]">
      <Award color="#202638" size={23} strokeWidth={1.8} />
    </View>
  );
}
