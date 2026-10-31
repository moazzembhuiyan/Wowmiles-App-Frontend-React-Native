import { useState } from 'react';
import { router } from 'expo-router';
import { BriefcaseBusiness, Gift, Plane } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { AuthHero } from '@/components/figma-auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const slides = [
  {
    title: 'Every booking earns miles',
    description: 'Register the travel bookings you already make. Once approved, WowMiles land straight in your balance.',
    icon: BriefcaseBusiness,
    badge: 'Confirmed',
  },
  {
    title: 'More miles, more rewards',
    description: 'Turn bookings into miles and redeem them for meaningful travel rewards.',
    icon: Gift,
    badge: '+1,250 miles',
  },
  {
    title: 'Your travel business, rewarded',
    description: 'Track your progress, grow your agency and unlock exclusive benefits.',
    icon: Plane,
    badge: 'Gold member',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const IllustrationIcon = slide.icon;

  function continueOnboarding() {
    if (step < slides.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    router.replace('/(auth)/signup');
  }

  return (
    <SafeAreaView className="w-full max-w-[440px] flex-1 self-center bg-[#121951]">
      <AuthHero className="flex-1 overflow-hidden px-5 pb-7 pt-3">
        <View className="flex-row justify-end">
          <Pressable onPress={() => router.replace('/(auth)/signup')} hitSlop={10}>
            <Text className="text-[12px] font-medium text-white/80">Skip</Text>
          </Pressable>
        </View>
        <View className="mt-10 flex-1 items-center justify-center">
          <View className="absolute left-1 top-5 h-32 w-32 rounded-full border border-white/15" />
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border border-white/25 bg-white/10">
            <IllustrationIcon color="white" size={40} strokeWidth={1.5} />
          </View>
          <View className="mb-6 rounded-full border border-white/20 bg-white/15 px-3 py-1.5">
            <Text className="text-[12px] font-medium text-white">✓  {slide.badge}</Text>
          </View>
          <Text className="max-w-[280px] text-center text-[24px] font-bold leading-[30px] text-white">
            {slide.title}
          </Text>
          <Text className="mt-3 max-w-[290px] text-center text-[14px] leading-[21px] text-[#D8DDF7]">
            {slide.description}
          </Text>
        </View>
        <View className="mb-4 flex-row justify-center">
          {slides.map((item, index) => (
            <View
              key={item.title}
              className={`mx-1 h-1.5 rounded-full ${index === step ? 'w-5 bg-[#FFB91F]' : 'w-1.5 bg-white/35'}`}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={continueOnboarding}
          className="h-[42px] items-center justify-center rounded-full bg-[#FFB91F]"
        >
          <Text className="text-[14px] font-semibold text-[#171A28]">
            {step === slides.length - 1 ? 'Get started' : 'Continue'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          className="mt-3 items-center py-1"
        >
          <Text className="text-[12px] text-white/80">
            Already have an account? <Text className="font-semibold text-white">Log in</Text>
          </Text>
        </Pressable>
      </AuthHero>
    </SafeAreaView>
  );
}
