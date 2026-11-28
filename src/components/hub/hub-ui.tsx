import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronRight, SendHorizontal } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TierKey } from '@/lib/api/profile';

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDay(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatDayShort(iso: string): string {
  const date = new Date(iso);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (start.getUTCDate() === end.getUTCDate() && start.getUTCMonth() === end.getUTCMonth()) {
    return formatDay(startIso);
  }
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${MONTHS[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  }
  return `${formatDayShort(startIso)} – ${formatDay(endIso)}`;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
}

export function timeAgo(iso: string): string {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.round(days / 7)}w ago`;
}

export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function Avatar({ name, size = 40, dark = false }: { name: string; size?: number; dark?: boolean }) {
  return (
    <View
      className={`items-center justify-center rounded-full ${dark ? 'bg-white' : 'bg-[#EEF0FC]'}`}
      style={{ width: size, height: size }}
    >
      <Text className="font-semibold text-brand" style={{ fontSize: size * 0.34 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

const tierStyles: Record<TierKey, { bg: string; text: string }> = {
  platinum: { bg: 'bg-[#6B5BD1]', text: 'text-white' },
  gold: { bg: 'bg-[#F5B21F]', text: 'text-ink' },
  silver: { bg: 'bg-[#D5D9E2]', text: 'text-ink' },
};

export function TierBadge({ tier, label }: { tier: TierKey; label?: string }) {
  const style = tierStyles[tier];
  return (
    <View className={`rounded-full px-2 py-0.5 ${style.bg}`}>
      <Text className={`text-[10px] font-bold tracking-[0.4px] ${style.text}`}>
        {(label ?? tier).toUpperCase()}
      </Text>
    </View>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`rounded-[16px] border border-line bg-white ${className}`}>{children}</View>;
}

export function SectionLabel({ children }: { children: string }) {
  return <Text className="mb-2 mt-5 text-[12px] font-semibold tracking-[0.6px] text-muted">{children.toUpperCase()}</Text>;
}

export function ListRow({
  title,
  detail,
  value,
  icon,
  onPress,
  last = false,
  trailing,
}: {
  title: string;
  detail?: string;
  value?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={`min-h-[56px] flex-row items-center px-4 py-3 active:opacity-70 ${last ? '' : 'border-b border-[#F0F1F5]'}`}
    >
      {icon ? (
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">{icon}</View>
      ) : null}
      <View className="flex-1">
        <Text className="text-[15px] font-medium text-ink">{title}</Text>
        {detail ? <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">{detail}</Text> : null}
      </View>
      {value ? <Text className="ml-2 text-[14px] text-muted">{value}</Text> : null}
      {trailing ?? (onPress ? <ChevronRight color="#9AA1B0" size={18} /> : null)}
    </Pressable>
  );
}

export function Chip({
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
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mb-2 mr-2 rounded-full border px-3.5 py-2 ${selected ? 'border-brand bg-brand' : 'border-line bg-white'}`}
    >
      <Text className={`text-[13px] font-medium ${selected ? 'text-white' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

export function TagPill({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-[#EEF0FC] px-3 py-1">
      <Text className="text-[12px] font-medium text-brand">{label}</Text>
    </View>
  );
}

export function FormButton({
  title,
  onPress,
  pending = false,
  disabled = false,
  tone = 'primary',
  className = '',
}: {
  title: string;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
  tone?: 'primary' | 'outline' | 'danger';
  className?: string;
}) {
  const toneClass =
    tone === 'primary'
      ? 'bg-brand'
      : tone === 'danger'
        ? 'border border-[#F3C9CF] bg-[#FFF5F6]'
        : 'border border-line bg-white';
  const textClass = tone === 'primary' ? 'text-white' : tone === 'danger' ? 'text-[#B62D3E]' : 'text-brand';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      className={`h-[52px] flex-row items-center justify-center rounded-[12px] px-4 active:opacity-80 disabled:opacity-50 ${toneClass} ${className}`}
    >
      {pending ? <ActivityIndicator color={tone === 'primary' ? '#FFFFFF' : '#4145B6'} className="mr-2" /> : null}
      <Text className={`text-[15px] font-semibold ${textClass}`}>{title}</Text>
    </Pressable>
  );
}

export function FieldError({ message }: { message?: string | null }) {
  return message ? <Text className="-mt-2 mb-3 text-[12px] text-[#B62D3E]">{message}</Text> : null;
}

/** Dark pill composer used by support chat and community replies. */
export function ComposerBar({
  value,
  onChangeText,
  onSend,
  placeholder,
  pending = false,
  disabled = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  pending?: boolean;
  disabled?: boolean;
}) {
  const canSend = value.trim().length > 0 && !pending && !disabled;
  return (
    <View className="mx-5 mb-3 mt-2 h-[58px] flex-row items-center rounded-full bg-[#11151F] pl-5 pr-2">
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A90A0"
        editable={!disabled}
        multiline={false}
        onSubmitEditing={canSend ? onSend : undefined}
        returnKeyType="send"
        className="h-full flex-1 text-[15px] text-white"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        disabled={!canSend}
        onPress={onSend}
        className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#F5B21F] disabled:opacity-50"
      >
        {pending ? <ActivityIndicator color="#11151F" /> : <SendHorizontal color="#11151F" size={18} />}
      </Pressable>
    </View>
  );
}

/** Gradient header used by the tab screens and hub sub-screens. */
export function HubHero({
  title,
  subtitle,
  onBack,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="relative -mx-5 mb-4 overflow-hidden px-5 pb-5" style={{ paddingTop: insets.top + 12 }}>
      <LinearGradient
        colors={['#11184F', '#29368F', '#454DC2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" className="absolute -right-8 -top-14 h-52 w-52 rounded-full border border-white/10" />
      <View pointerEvents="none" className="absolute right-6 -top-4 h-32 w-32 rounded-full border border-white/10" />
      <View className="flex-row items-center">
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
            hitSlop={8}
          >
            <ArrowLeft color="white" size={20} />
          </Pressable>
        ) : null}
        <Text className="flex-1 text-[24px] font-bold text-white">{title}</Text>
        {right}
      </View>
      {subtitle ? <Text className="mt-2 text-[13px] text-[#D8DAF2]">{subtitle}</Text> : null}
      {children}
    </View>
  );
}

export function goBack(fallback: Parameters<typeof router.replace>[0] = '/(tabs)') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
