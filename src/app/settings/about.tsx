import { router } from 'expo-router';
import { Award, ExternalLink, Info } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { Card, ListRow, SectionLabel, goBack } from '@/components/hub/hub-ui';
import { APP_INFO, LEGAL_LINKS } from '@/lib/api/settings';

export default function AboutScreen() {
  return (
    <MilesScreen>
      <MilesHeader title="About" onBack={() => goBack('/(tabs)/profile')} />

      <View className="items-center py-4">
        <View className="h-[84px] w-[84px] items-center justify-center rounded-[26px] bg-[#F5B21F]">
          <Award color="#11151F" size={38} />
        </View>
        <Text className="mt-4 text-[24px] font-bold text-ink">WowMiles</Text>
        <Text className="mt-1 text-[14px] text-muted">
          Version {APP_INFO.version} {'·'} Operated by {APP_INFO.operator}
        </Text>
      </View>

      <View className="mb-1 mt-3 flex-row items-center">
        <Info color="#7C8494" size={15} />
        <Text className="ml-2 text-[12px] font-semibold tracking-[0.6px] text-muted">ABOUT YOUR MILES</Text>
      </View>
      <Text className="text-[14px] leading-[22px] text-muted">
        WowMiles have no cash value and cannot be sold, transferred or exchanged for money. They are redeemable only for
        rewards in this app. {APP_INFO.operator} may reverse miles from bookings that are cancelled or cannot be verified.
      </Text>

      <SectionLabel>Legal</SectionLabel>
      <Card>
        {LEGAL_LINKS.map((link) => (
          <ListRow
            key={link.key}
            title={link.title}
            trailing={<ExternalLink color="#9AA1B0" size={16} />}
            onPress={() => router.push({ pathname: '/settings/legal/[key]', params: { key: link.key } })}
          />
        ))}
        <ListRow
          title="Open source licences"
          trailing={<ExternalLink color="#9AA1B0" size={16} />}
          onPress={() => router.push({ pathname: '/settings/legal/[key]', params: { key: 'aboutUs' } })}
          last
        />
      </Card>

      <Text className="mt-6 text-center text-[12px] text-muted">
        {'©'} 2026 {APP_INFO.operator}. All rights reserved.
      </Text>
    </MilesScreen>
  );
}
