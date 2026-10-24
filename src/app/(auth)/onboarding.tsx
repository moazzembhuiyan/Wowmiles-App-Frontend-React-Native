import { useState } from 'react';
import { router } from 'expo-router';
import { BriefcaseBusiness, Gift, Plane } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { Screen, PrimaryButton } from '@/components/ui';

const slides = [
  {
    title: 'Every booking earns miles',
    description: 'Register customer bookings across hotels, cruises, tours and more. Once approved, WowMiles land straight in your balance.',
    icon: BriefcaseBusiness,
    badge: 'Approved',
  },
  {
    title: 'More miles, more rewards',
    description: 'Turn the bookings you already make into miles and redeem them for meaningful travel rewards.',
    icon: Gift,
    badge: '+1,250 miles',
  },
  {
    title: 'Your travel business, rewarded',
    description: 'Track your progress, grow your agency and unlock exclusive benefits with every trip.',
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
    <Screen className="bg-canvas">
      <View className="flex-row justify-end pt-2">
        <Pressable onPress={() => router.replace('/(auth)/signup')} hitSlop={10}>
          <Text className="text-[14px] font-medium text-muted">Skip</Text>
        </Pressable>
      </View>
      <View className="mt-8 h-[285px] items-center justify-center rounded-[28px] bg-[#EEF0FC]">
        <View className="absolute left-5 top-8 rounded-full bg-white px-3 py-2">
          <Text className="text-[12px] font-semibold text-ink">✦  +1,250</Text>
        </View>
        <View className="h-[132px] w-[132px] items-center justify-center rounded-full bg-brand">
          <IllustrationIcon color="white" size={62} strokeWidth={1.6} />
        </View>
        <View className="absolute bottom-8 right-5 rounded-full bg-white px-3 py-2">
          <Text className="text-[12px] font-semibold text-[#43876A]">✓  {slide.badge}</Text>
        </View>
      </View>
      <View className="mt-9 px-2">
        <Text className="text-center text-[25px] font-bold leading-8 text-ink">{slide.title}</Text>
        <Text className="mt-3 text-center text-[15px] leading-[23px] text-muted">
          {slide.description}
        </Text>
      </View>
      <View className="mt-auto">
        <View className="mb-7 flex-row justify-center gap-2">
          {slides.map((item, index) => (
            <View
              key={item.title}
              className={`h-2 rounded-full ${index === step ? 'w-6 bg-brand' : 'w-2 bg-[#D6D9E4]'}`}
            />
          ))}
        </View>
        <PrimaryButton
          title={step === slides.length - 1 ? 'Get started' : 'Continue'}
          onPress={continueOnboarding}
        />
        <View className="h-5" />
      </View>
    </Screen>
  );
}
