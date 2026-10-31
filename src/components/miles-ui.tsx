import { router } from 'expo-router';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { Screen } from '@/components/ui';

export function MilesScreen({
  children,
  fullBleedTop = false,
}: {
  children: React.ReactNode;
  fullBleedTop?: boolean;
}) {
  if (!fullBleedTop) {
    return <Screen className="bg-canvas">{children}</Screen>;
  }

  return (
    <View className="flex-1 bg-canvas">
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function MilesHeader({
  title,
  subtitle,
  onBack,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-5 flex-row items-center pt-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={onBack ?? (() => router.back())}
        className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-transparent"
        hitSlop={8}
      >
        <ArrowLeft color="#252B3A" size={21} />
      </Pressable>
      <View className="flex-1">
        <Text className="text-[22px] font-semibold text-ink">{title}</Text>
        {subtitle ? <Text className="mt-0.5 text-[13px] text-muted">{subtitle}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text className="text-[13px] font-semibold text-brand">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[18px] font-semibold text-ink">{title}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="link" onPress={onAction} className="flex-row items-center">
          <Text className="text-[13px] font-semibold text-brand">{action}</Text>
          <ChevronRight color="#4145B6" size={15} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function DataRow({
  icon,
  title,
  detail,
  value,
  onPress,
  last = false,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  value?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={`flex-row items-center py-3 ${last ? '' : 'border-b border-[#F0F1F5]'}`}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">
        {icon}
      </View>
      <View className="flex-1">
        <Text numberOfLines={1} className="text-[14px] font-medium text-ink">{title}</Text>
        <Text className="mt-1 text-[13px] leading-[19px] text-muted">{detail}</Text>
      </View>
      {value ? <Text className="ml-2 text-[14px] font-semibold text-ink">{value}</Text> : null}
    </Pressable>
  );
}

export function Pill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mr-2 rounded-full border px-3.5 py-2 ${selected ? 'border-brand bg-[#F0F1FB]' : 'border-line bg-white'}`}
    >
      <Text className={`text-[13px] font-medium ${selected ? 'text-brand' : 'text-muted'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
