import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function FeatureHero({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="relative -mx-5 mb-4 overflow-hidden px-5 pb-5"
      style={{ paddingTop: insets.top + 8 }}
    >
      <LinearGradient
        colors={['#11184F', '#29368F', '#454DC2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" className="absolute -right-8 -top-14 h-52 w-52 rounded-full border border-white/10" />

      {/* Row 1: back + title + action */}
      <View className="flex-row items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)');
          }}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
          hitSlop={8}
        >
          <ArrowLeft color="white" size={20} />
        </Pressable>
        <Text className="flex-1 text-[20px] font-semibold text-white">{title}</Text>
        {children}
      </View>

      {/* Row 2: subtitle */}
      {subtitle ? (
        <Text className="mt-3 text-[13px] text-[#D8DAF2]">{subtitle}</Text>
      ) : null}
    </View>
  );
}
export function SectionHeading({ title, action, onAction }: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-[18px] font-semibold text-[#202638]">{title}</Text>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text className="text-[13px] font-semibold text-[#4145B6]">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
