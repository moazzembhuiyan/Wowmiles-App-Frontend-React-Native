import { ArrowUpRight, Award, ConciergeBell, ShieldCheck, Star, UsersRound } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { MilesHeader, MilesScreen, SectionTitle } from '@/components/miles-ui';

const platinumBenefits = [
  {
    title: '1.5× miles on every booking',
    detail: 'Every approved booking earns 50% more than the standard rate, across all seven booking types.',
    Icon: ArrowUpRight,
  },
  {
    title: 'Global brand ambassador badge',
    detail: 'Displayed on your profile and in the community forum, visible to partner brands.',
    Icon: Award,
  },
  {
    title: 'Dedicated concierge',
    detail: 'A named Beverly Group contact on WhatsApp Business, replying within 4 working hours.',
    Icon: ConciergeBell,
  },
  {
    title: 'VIP trade fair access',
    detail: 'Priority invitations and access to exclusive travel trade fair experiences.',
    Icon: Star,
  },
];

export default function TierBenefitsScreen() {
  return (
    <MilesScreen>
      <MilesHeader title="Platinum Ambassador" />

      <View className="mb-5 rounded-[20px] bg-[#EFEAFC] px-5 py-5">
        <View className="flex-row items-center justify-center">
          <Award color="#7655C7" size={16} />
          <Text className="ml-2 text-[12px] font-semibold text-[#7655C7]">Platinum Ambassador</Text>
        </View>
        <Text className="mt-4 text-center text-[22px] font-bold text-ink">The top of the WowMiles ladder</Text>
        <Text className="mt-2 text-center text-[14px] text-muted">Unlocks at 80,000 lifetime miles</Text>
        <View className="mt-4 h-[7px] overflow-hidden rounded-full bg-white">
          <View className="h-full w-[61%] rounded-full bg-[#795ACB]" />
        </View>
        <Text className="mt-2 text-center text-[13px] text-muted">48,500 of 80,000 miles · 31,500 to go</Text>
      </View>

      <SectionTitle title="What you unlock" />
      {platinumBenefits.map(({ title, detail, Icon }) => (
        <View key={title} className="mb-2.5 rounded-[15px] bg-white p-4">
          <View className="flex-row items-center">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-[11px] bg-[#F0ECFA]">
              <Icon color="#7655C7" size={17} />
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-ink">{title}</Text>
          </View>
          <Text className="mt-2.5 text-[14px] leading-[21px] text-muted">{detail}</Text>
        </View>
      ))}
      <View className="mb-4 flex-row items-center rounded-[13px] border border-[#E8E3F5] bg-[#F7F5FC] p-3.5">
        <UsersRound color="#7655C7" size={17} />
        <Text className="ml-2 flex-1 text-[13px] leading-[19px] text-muted">
          Your progress is based on lifetime miles earned through approved bookings, learning and events.
        </Text>
        <ShieldCheck color="#7655C7" size={16} />
      </View>
    </MilesScreen>
  );
}
