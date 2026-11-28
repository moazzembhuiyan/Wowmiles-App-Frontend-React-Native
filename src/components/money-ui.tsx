import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Info, Upload } from 'lucide-react-native';

export const miles = (value: number) => `${value < 0 ? '−' : ''}${Math.abs(value).toLocaleString('en-US')}`;

export function formatDate(iso: string, withYear = false) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  });
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <View className={`mb-4 rounded-[16px] bg-white p-4 ${className}`}>{children}</View>;
}

export function Eyebrow({ children }: { children: string }) {
  return <Text className="mb-2 text-[12px] font-medium tracking-[0.7px] text-[#747B8B]">{children}</Text>;
}

export function KeyValue({
  label,
  value,
  tone = 'default',
  last = false,
}: {
  label: string;
  value: string;
  tone?: 'default' | 'negative' | 'positive';
  last?: boolean;
}) {
  const color = tone === 'negative' ? 'text-[#B63D45]' : tone === 'positive' ? 'text-[#168052]' : 'text-ink';
  return (
    <View className={`flex-row items-center justify-between py-3 ${last ? '' : 'border-b border-[#F0F1F5]'}`}>
      <Text className="mr-3 flex-1 text-[14px] text-muted">{label}</Text>
      <Text className={`text-[14px] font-semibold ${color}`}>{value}</Text>
    </View>
  );
}

export function GoldButton({
  title,
  onPress,
  disabled = false,
  loading = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      onPress={onPress}
      className={`mb-3 h-[52px] flex-row items-center justify-center rounded-full ${off ? 'bg-[#E9D9AE]' : 'bg-[#FFB91F]'}`}
    >
      {loading ? <ActivityIndicator color="#171A28" /> : null}
      <Text className={`text-[15px] font-semibold text-[#171A28] ${loading ? 'ml-2' : ''}`}>{title}</Text>
    </Pressable>
  );
}

export function TextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="mb-6 h-[46px] items-center justify-center">
      <Text className="text-[14px] font-semibold text-brand">{title}</Text>
    </Pressable>
  );
}

export function Banner({
  tone,
  title,
  children,
}: {
  tone: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  children?: React.ReactNode;
}) {
  const palette = {
    info: { box: 'border-[#DCE0F5] bg-[#F0F1FB]', text: 'text-brand', icon: '#4145B6' },
    warning: { box: 'border-[#F0E2C3] bg-[#FFF9ED]', text: 'text-[#8F6818]', icon: '#8F6818' },
    danger: { box: 'border-[#F3C9CF] bg-[#FFF5F6]', text: 'text-[#B62D3E]', icon: '#B62D3E' },
    success: { box: 'border-[#CDEBDD] bg-[#F0FBF5]', text: 'text-[#168052]', icon: '#168052' },
  }[tone];
  const Icon = tone === 'success' ? CheckCircle2 : tone === 'info' ? Info : AlertTriangle;
  return (
    <View className={`mb-4 flex-row rounded-[14px] border p-4 ${palette.box}`}>
      <Icon color={palette.icon} size={18} />
      <View className="ml-3 flex-1">
        <Text className={`text-[14px] font-semibold ${palette.text}`}>{title}</Text>
        {children ? <Text className="mt-1 text-[13px] leading-[19px] text-[#626A79]">{children}</Text> : null}
      </View>
    </View>
  );
}

/** Dark pill bar pinned to the bottom with a caption, a value and a gold action. */
export function BottomBar({
  caption,
  value,
  action,
  onPress,
  disabled = false,
  loading = false,
}: {
  caption: string;
  value: string;
  action: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const off = disabled || loading;
  return (
    <View className="bg-canvas px-3 pb-3 pt-2">
      <View className="min-h-[64px] flex-row items-center rounded-full bg-[#10131D] py-1.5 pl-5 pr-1.5">
        <View className="flex-1 pr-2">
          <Text className="text-[12px] text-white/55">{caption}</Text>
          <Text className="mt-0.5 text-[15px] font-medium text-white">{value}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: off, busy: loading }}
          disabled={off}
          onPress={onPress}
          className={`min-h-[52px] min-w-[120px] flex-row items-center justify-center rounded-full px-6 ${off ? 'bg-[#B7B8C6]' : 'bg-[#F5B21F]'}`}
        >
          {loading ? <ActivityIndicator color="#171A28" /> : null}
          <Text className="text-[15px] font-semibold text-[#171A28]">{action}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Rows card: label with optional sub-line on the left, value on the right. */
export function SummaryCard({
  rows,
}: {
  rows: { label: string; sub?: string; value: string; accent?: boolean }[];
}) {
  return (
    <View className="mb-5 rounded-[18px] border border-line bg-white px-4">
      {rows.map((row, index) => (
        <View
          key={row.label}
          className={`flex-row items-center py-3.5 ${index < rows.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
        >
          <View className="flex-1 pr-3">
            <Text className={`text-[16px] ${row.accent ? 'text-ink' : 'text-[#555D6E]'}`}>{row.label}</Text>
            {row.sub ? <Text className="mt-0.5 text-[13px] text-muted">{row.sub}</Text> : null}
          </View>
          <Text className={`text-[16px] font-medium ${row.accent ? 'text-[#A85F05]' : 'text-ink'}`}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function FootNote({ icon, children }: { icon?: React.ReactNode; children: string }) {
  return (
    <View className="mb-5 flex-row px-1">
      {icon ?? <Info color="#858B98" size={16} />}
      <Text className="ml-3 flex-1 text-[14px] leading-[21px] text-muted">{children}</Text>
    </View>
  );
}

/** Three-step "what happens next" list. */
export function NextSteps({
  steps,
  tone = 'green',
}: {
  steps: { title: string; sub: string; state: 'done' | 'pending' | 'todo' }[];
  tone?: 'green' | 'red';
}) {
  const done = tone === 'red' ? '#D6382F' : '#0B9A5E';
  return (
    <View className="mb-5">
      <Text className="mb-3 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">WHAT HAPPENS NEXT</Text>
      {steps.map((step, index) => (
        <View key={step.title} className="flex-row">
          <View className="mr-3 items-center">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: step.state === 'done' ? (tone === 'red' ? '#FDECEA' : '#E8F8F0') : step.state === 'pending' ? '#FFF5DF' : 'transparent' }}
            >
              {step.state === 'done' ? (
                <CheckCircle2 color={done} size={17} />
              ) : step.state === 'pending' ? (
                <Clock3 color={tone === 'red' ? '#D6382F' : '#D9730D'} size={17} />
              ) : (
                <Upload color={tone === 'red' ? '#D6382F' : '#8991A0'} size={17} />
              )}
            </View>
            {index < steps.length - 1 ? <View className="h-3 w-px bg-[#DDE1E8]" /> : null}
          </View>
          <View className="flex-1 pb-3 pt-0.5">
            <Text className={`text-[16px] ${step.state === 'done' ? 'text-ink' : 'text-[#555D6E]'}`}>{step.title}</Text>
            <Text className="text-[14px] text-muted">{step.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** Light header used by checkout screens: round back button, centred title, big heading. */
export function CheckoutHeader({ title, heading, subtitle }: { title: string; heading?: string; subtitle?: string }) {
  return (
    <View className="mb-4">
      <View className="mb-5 flex-row items-center justify-between pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
          hitSlop={8}
        >
          <ArrowLeft color="#252B3A" size={19} />
        </Pressable>
        <Text className="text-[15px] font-semibold text-ink">{title}</Text>
        <View className="h-10 w-10" />
      </View>
      {heading ? <Text className="text-[30px] font-bold leading-[38px] text-ink">{heading}</Text> : null}
      {subtitle ? <Text className="mt-2 text-[15px] text-muted">{subtitle}</Text> : null}
    </View>
  );
}

/** Full-bleed outcome header (green for success, red for failure). */
export function OutcomeHero({
  tone,
  title,
  subtitle,
}: {
  tone: 'success' | 'failure';
  title: string;
  subtitle: string;
}) {
  const insets = useSafeAreaInsets();
  const colors: [string, string, string] =
    tone === 'success' ? ['#0F3D2B', '#17603F', '#21845A'] : ['#5C1219', '#3A0F14', '#1E070B'];
  return (
    <View className="relative -mx-5 mb-4 overflow-hidden px-5 pb-8" style={{ paddingTop: insets.top + 40 }}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View pointerEvents="none" className="absolute -right-8 -top-14 h-60 w-60 rounded-full border border-white/10" />
      <View className="mb-4 h-[52px] w-[52px] items-center justify-center rounded-full border border-white/25 bg-white/15">
        <CheckCircle2 color="white" size={22} />
      </View>
      <Text className="text-[32px] font-bold leading-[38px] text-white">{title}</Text>
      <Text className="mt-2 text-[15px] leading-[22px] text-white/70">{subtitle}</Text>
    </View>
  );
}

/** Scrolling checkout page with a pinned footer (usually a BottomBar). */
export function CheckoutScreen({
  children,
  footer,
  fullBleedTop = false,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  fullBleedTop?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-canvas">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: fullBleedTop ? 0 : insets.top,
          paddingBottom: footer ? 120 + insets.bottom : 24 + insets.bottom,
        }}
      >
        {children}
      </ScrollView>
      {footer ? <View style={{ paddingBottom: insets.bottom }} className="absolute bottom-0 left-0 right-0">{footer}</View> : null}
    </View>
  );
}
