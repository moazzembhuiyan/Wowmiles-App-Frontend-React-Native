import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2, Gift, Info } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { MilesHeader, MilesScreen } from '@/components/miles-ui';
import { miles } from '@/components/money-ui';
import { QueryView } from '@/components/states';
import { getStatus } from '@/lib/api/status';
import { getWallet } from '@/lib/api/wallet';

export default function WalletBySupplierScreen() {
  const query = useQuery({ queryKey: ['wallet'], queryFn: getWallet });
  const status = useQuery({ queryKey: ['status'], queryFn: getStatus });

  return (
    <MilesScreen>
      <MilesHeader title="Wallet" />
      <Text className="mb-1 text-[28px] font-bold leading-9 text-ink">Where your miles come from</Text>
      <Text className="mb-5 text-[15px] text-muted">One balance, tracked by supplier</Text>
      <QueryView query={query}>
        {(wallet) => (
          <>
            <View className="mb-5 overflow-hidden rounded-[20px] p-4">
              <LinearGradient
                colors={['#11184F', '#29368F', '#454DC2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View className="flex-row items-center">
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-[12px] bg-white/15">
                  <Building2 color="white" size={20} />
                </View>
                <View>
                  <Text className="text-[17px] font-medium text-white">{wallet.agency?.name ?? 'Your wallet'}</Text>
                  <Text className="mt-0.5 text-[13px] text-[#D8DAF2]">
                    {wallet.agency ? `Agency wallet · ${wallet.agency.authorisedUsers} authorised users` : 'Personal wallet'}
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row items-baseline">
                <Text className="text-[40px] font-bold text-white">{miles(wallet.available)}</Text>
                <Text className="ml-2 text-[15px] text-[#D8DAF2]">miles available</Text>
              </View>
            </View>

            <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">BALANCE BY SUPPLIER</Text>
            <View className="mb-5 rounded-[18px] border border-line bg-white px-4">
              {wallet.bySupplier.map((row, index) => (
                <View
                  key={row.supplier?.id ?? 'platform'}
                  className={`flex-row items-center py-3.5 ${index < wallet.bySupplier.length - 1 ? 'border-b border-[#EEF0F4]' : ''}`}
                >
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-[12px] bg-[#F1F1FB]">
                    <Gift color="#4145B6" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[16px] font-medium text-ink">{row.supplier?.name ?? 'WowMiles'}</Text>
                    <Text className="mt-0.5 text-[13px] text-muted">
                      {`${miles(row.available)} miles · worth €${row.eurValue.toLocaleString('en-US')}`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text className="mb-2 text-[12px] font-semibold tracking-[0.8px] text-[#747B8B]">YOUR SHARE</Text>
            <View className="mb-5 flex-row items-center rounded-[18px] border border-line bg-white p-4">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-[#ECEEFB]">
                <Text className="text-[14px] font-semibold text-brand">DR</Text>
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-[16px] font-medium text-ink">You this year</Text>
                <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
                  {`${miles(wallet.earnedThisYear)} miles earned into the agency wallet`}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[16px] font-semibold text-ink">{status.data ? miles(status.data.points) : '—'}</Text>
                <Text className="text-[12px] text-muted">your points</Text>
              </View>
            </View>

            <View className="mb-8 flex-row px-1">
              <Info color="#858B98" size={16} />
              <Text className="ml-3 flex-1 text-[13px] leading-[20px] text-muted">
                Miles from any supplier can go toward one reward once they are out of the pending period. At checkout you choose the sources or let WowMiles pick them.
              </Text>
            </View>
          </>
        )}
      </QueryView>
    </MilesScreen>
  );
}
