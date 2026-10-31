import { useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, CheckCircle2, CircleHelp, Hotel } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { appNotifications } from '@/components/miles-data';
import { MilesHeader, MilesScreen, SectionTitle } from '@/components/miles-ui';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const notification = appNotifications.find((item) => item.id === id);

  if (!notification) {
    return (
      <MilesScreen>
        <MilesHeader title="Notification" />
        <View className="items-center rounded-[16px] bg-white px-6 py-10">
          <CircleHelp color="#4145B6" size={28} />
          <Text className="mt-3 text-[15px] font-semibold text-ink">Notification not found</Text>
          <Text className="mt-1 text-center text-[12px] leading-[18px] text-muted">
            This update may have been removed. Go back to see your latest notifications.
          </Text>
        </View>
      </MilesScreen>
    );
  }

  const isBooking = notification.id === 'booking-approved';

  return (
    <MilesScreen>
      <MilesHeader title="Notifications" />

      <View className="mb-5 items-center rounded-[18px] bg-white px-5 py-6">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-[#E8F7F0]">
          {isBooking ? <CheckCircle2 color="#2A9A6A" size={27} /> : <ArrowUpRight color="#4145B6" size={25} />}
        </View>
        <Text className="mt-4 text-center text-[20px] font-bold text-ink">{notification.title}</Text>
        <View className="mt-2 rounded-full bg-[#E8F7F0] px-3 py-1">
          <Text className="text-[13px] font-semibold text-[#23875D]">
            {isBooking ? '•  Approved' : notification.category}
          </Text>
        </View>
        <Text className="mt-4 text-center text-[13px] leading-[21px] text-muted">
          {isBooking
            ? 'Beverly Group has approved your registration. 1,250 WowMiles have been credited to your balance immediately.'
            : notification.message}
        </Text>
      </View>

      {isBooking ? (
        <>
          <SectionTitle title="Booking details" />
          <View className="mb-5 rounded-[16px] bg-white px-4">
            <View className="flex-row items-center border-b border-[#F0F1F5] py-3">
              <View className="mr-3 h-9 w-9 items-center justify-center rounded-[11px] bg-[#F1F1FB]">
                <Hotel color="#4145B6" size={18} />
              </View>
              <View className="flex-1">
                <Text className="text-[12px] text-muted">BOOKING</Text>
                <Text className="mt-1 text-[13px] font-medium text-ink">Hilton Dubai — 4 nights</Text>
              </View>
            </View>
            <DetailRow label="Reference" value="WM-2026-0842" />
            <DetailRow label="Supplier" value="Hilton Hotels" />
            <DetailRow label="Type" value="Hotel" />
            <DetailRow label="Registered" value="12 Oct 2026" />
            <DetailRow label="Miles earned" value="+1,250" last />
          </View>
        </>
      ) : null}

      <Text className="mb-5 text-center text-[12px] text-muted">{notification.time}</Text>
    </MilesScreen>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={`flex-row items-center justify-between py-3 ${last ? '' : 'border-b border-[#F0F1F5]'}`}>
      <Text className="text-[12px] text-muted">{label}</Text>
      <Text className="text-[12px] font-medium text-ink">{value}</Text>
    </View>
  );
}
