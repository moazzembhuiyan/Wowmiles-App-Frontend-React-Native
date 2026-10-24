import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, CalendarDays, TicketCheck, UserRound } from 'lucide-react-native';
import { PrimaryButton } from './ui';
import { useRouter } from 'expo-router';

const icons = {
  bookings: TicketCheck,
  academy: BookOpen,
  events: CalendarDays,
  profile: UserRound,
} as const;

const descriptions = {
  bookings: 'Register a customer booking and keep track of your submissions.',
  academy: 'Explore learning modules and earn miles as you grow your travel expertise.',
  events: 'Discover upcoming travel events, fairs and partner experiences.',
  profile: 'Manage your account, agency details and WowMiles preferences.',
} as const;

export function FeatureTab({ screen }: { screen: keyof typeof icons }) {
  const Icon = icons[screen];
  const title = screen.charAt(0).toUpperCase() + screen.slice(1);
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="w-full max-w-[440px] flex-1 self-center bg-canvas px-5 pt-5">
      <Text className="text-[26px] font-bold text-ink">{title}</Text>
      <Text className="mt-2 text-[14px] leading-[21px] text-muted">{descriptions[screen]}</Text>
      <View className="mt-8 items-center rounded-[18px] border border-line bg-white px-7 py-10">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF0FC]">
          <Icon color="#4145B6" size={29} strokeWidth={1.8} />
        </View>
        <Text className="text-center text-[17px] font-semibold text-ink">{title} are coming up</Text>
        <Text className="mt-2 text-center text-[13px] leading-5 text-muted">
          Your WowMiles {screen} experience will be available here.
        </Text>

        <PrimaryButton
          className="mt-4 bg-ink"
          title={`Log Out`}
          onPress={() => router.push(`/login`)}
        />
      </View>
    </SafeAreaView>
  );
}
