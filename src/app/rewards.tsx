import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, LockKeyhole, Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { rewardCatalog } from '@/components/rewards-data';

const categories = ['All', 'Travel', 'Experiences', 'Merch'] as const;
type RewardCategory = (typeof categories)[number];

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<RewardCategory>('All');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => rewardCatalog.filter((reward) =>
      (category === 'All' || reward.category === category) &&
      reward.title.toLowerCase().includes(search.toLowerCase()),
    ),
    [category, search],
  );

  return (
    <View className="flex-1 bg-[#F8F9FB]">
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 top-0 bg-[#11184F]"
        style={{ height: insets.top }}
      />
      <SafeAreaView
        edges={['bottom']}
        className="w-full max-w-[440px] flex-1 self-center bg-transparent"
      >
        <StatusBar style="light" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, backgroundColor: '#F8F9FB' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            className="relative overflow-hidden px-5 pb-5"
            style={{ height: insets.top + 226, paddingTop: insets.top + 12 }}
          >
            <LinearGradient
              colors={['#11184F', '#29368F', '#5969D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View
              pointerEvents="none"
              className="absolute -right-7 -top-14 h-52 w-52 rounded-full border border-white/10"
            />
            <View
              pointerEvents="none"
              className="absolute -right-2 -top-2 h-40 w-40 rounded-full border border-white/10"
            />
            <View className="flex-row items-center">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => {
                  if (router.canGoBack()) router.back();
                  else router.replace('/(tabs)');
                }}
                className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20"
                hitSlop={8}
              >
                <ArrowLeft color="white" size={20} />
              </Pressable>
              <Text className="flex-1 text-[18px] font-semibold text-white">Rewards</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={searching ? 'Close reward search' : 'Search rewards'}
                onPress={() => {
                  setSearching((value) => !value);
                  setSearch('');
                }}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                hitSlop={8}
              >
                <Search color="white" size={19} />
              </Pressable>
            </View>
            <View className="mt-auto">
              <Text className="text-[11px] font-medium tracking-[0.8px] text-[#D8DAF2]">
                AVAILABLE TO REDEEM
              </Text>
              <View className="mt-1 flex-row items-baseline">
                <Text className="text-[36px] font-bold leading-[42px] tracking-[-0.8px] text-white">
                  48,500
                </Text>
                <Text className="ml-2 text-[13px] text-[#D8DAF2]">miles</Text>
              </View>
            </View>
          </View>

          <View className="-mt-0.5 flex-1  bg-[#F8F9FB] px-5 pt-4">
            {searching ? (
              <TextInput
                accessibilityLabel="Search rewards"
                autoFocus
                value={search}
                onChangeText={setSearch}
                placeholder="Search rewards"
                placeholderTextColor="#858B98"
                className="mb-3 h-[44px] rounded-[12px] border border-[#E5E8EF] bg-white px-4 text-[14px] text-[#202638]"
              />
            ) : null}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 max-h-10"
              contentContainerStyle={{ alignItems: 'center' }}
            >
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(item)}
                    className={`mr-2 rounded-full border px-3.5 py-2 ${
                      selected ? 'border-[#4145B6] bg-[#4145B6]' : 'border-[#E5E8EF] bg-white'
                    }`}
                  >
                    <Text className={`text-[12px] font-medium ${selected ? 'text-white' : 'text-[#555D6E]'}`}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View className="flex-row flex-wrap justify-between">
              {filtered.map((reward) => {
                const { id, title, cost, Icon, color } = reward;
                const locked = 'locked' in reward && reward.locked;
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={`${title}${locked ? ', Platinum reward' : `, ${cost.toLocaleString()} miles`}`}
                    onPress={() => {
                      if (locked) router.push('/tier-benefits');
                      else router.push({ pathname: '/reward-detail', params: { id } });
                    }}
                    className="mb-4 w-[48.5%]"
                  >
                  <View className="relative h-[130px] overflow-hidden rounded-[16px]">
                    <LinearGradient
                      colors={color}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View
                      pointerEvents="none"
                      className="absolute -right-5 -top-9 h-28 w-28 rounded-full border border-white/15"
                    />
                    <View
                      pointerEvents="none"
                      className="absolute -right-2 -top-4 h-20 w-20 rounded-full border border-white/15"
                    />
                    {locked ? (
                      <View className="absolute left-2 top-2 flex-row items-center rounded-full bg-[#1B2032]/65 px-2 py-1">
                        <LockKeyhole color="white" size={10} />
                        <Text className="ml-1 text-[10px] font-medium text-white">Platinum</Text>
                      </View>
                    ) : null}
                    <View className="absolute bottom-3 left-3 h-8 w-8 items-center justify-center">
                      <Icon color="white" size={24} strokeWidth={1.4} />
                    </View>
                  </View>
                  <Text numberOfLines={1} className="mt-2 text-[13px] font-medium text-[#202638]">
                    {title}
                  </Text>
                  {locked ? (
                    <Text className="mt-1 text-[11px] text-[#747B8B]">Platinum members only</Text>
                  ) : (
                    <Text className="mt-1 text-[13px] font-semibold text-[#A85F05]">
                      {cost.toLocaleString()}
                      <Text className="text-[11px] font-normal text-[#747B8B]"> miles</Text>
                    </Text>
                  )}
                  </Pressable>
                );
              })}
            </View>
            {filtered.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-[15px] font-semibold text-[#202638]">No rewards found</Text>
                <Text className="mt-1 text-[13px] text-[#747B8B]">Try a different search or category.</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
