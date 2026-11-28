import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AuthFooter, AuthHero } from '@/components/figma-auth';
import { fetchKycDetail, type KycDetail } from '@/lib/api/auth';

const STEP_TITLES = { submitted: 'Details submitted', review: 'Agency review', activated: 'Account activated' } as const;
const STEP_ICON = { done: ['✓', '#378764'], in_progress: ['◷', '#C18A20'], pending: ['○', '#858A96'], failed: ['×', '#B84444'], action_required: ['!', '#C18A20'] } as const;
const STEP_DETAIL = { in_progress: 'In progress', pending: 'Pending', action_required: 'Action needed' } as const;

function stepDate(iso: string | null) {
  if (!iso) return 'Done';
  const at = new Date(iso);
  const day = at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${day} · ${at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

/** Rows of the progress card; shows the usual three steps until the review status loads. */
function progressRows(steps: KycDetail['steps'] | undefined) {
  const rows = steps ?? [
    { key: 'submitted' as const, state: 'done' as const, at: null },
    { key: 'review' as const, state: 'in_progress' as const, at: null },
    { key: 'activated' as const, state: 'pending' as const, at: null },
  ];
  return rows.map((step) => ({
    title: STEP_TITLES[step.key],
    detail: step.state === 'done' || step.state === 'failed' ? stepDate(step.at) : STEP_DETAIL[step.state],
    icon: STEP_ICON[step.state][0],
    color: STEP_ICON[step.state][1],
  }));
}

export default function VerificationPendingScreen() {
  const kyc = useQuery({ queryKey: ['kyc', 'me'], queryFn: fetchKycDetail });
  const rows = progressRows(kyc.data?.steps);

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-[#F8F9FB]">
      <AuthHero className="h-[270px] overflow-hidden px-5 pt-8">
        <View className="mb-4 h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Clock3 color="white" size={16} strokeWidth={1.8} />
        </View>
        <Text className="text-[20px] font-bold leading-[25px] text-white">
          Your agency is being verified
        </Text>
        <Text className="mt-2 text-[13px] leading-[19px] text-[#DCE0F5]">
          Beverly Group is reviewing the details you submitted.
        </Text>
      </AuthHero>
      <View className="-mt-5 flex-1 rounded-t-[20px] bg-[#F8F9FB] px-5 pt-5">
        <Text className="mb-3 text-[12px] font-semibold tracking-[0.7px] text-[#72798A]">PROGRESS</Text>
        <View className="rounded-[13px] bg-white px-4 py-3">
          {rows.map(({ icon, title, detail, color }, index) => (
            <View key={title} className="flex-row items-start">
              <View className="mr-3 items-center">
                <Text className="text-[12px] font-bold" style={{ color }}>{icon}</Text>
                {index < rows.length - 1 ? <View className="my-1 h-5 w-px bg-[#E4E7ED]" /> : null}
              </View>
              <View className="pb-2">
                <Text className="text-[13px] font-medium text-[#252A38]">{title}</Text>
                <Text className="mt-0.5 text-[12px] text-[#858A96]">{detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className="mt-3 rounded-[10px] bg-[#EEF7FF] px-3 py-2.5">
          <Text className="text-[12px] leading-[18px] text-[#4D7697]">
            Most agencies are approved within 2 business days.
          </Text>
        </View>
        <View className="mt-3">
          <Text className="text-[12px] text-[#777E8D]">Need help?</Text>
          <Text className="mt-0.5 text-[13px] font-medium text-[#252A38]">Beverly Group support</Text>
        </View>
      </View>
      <AuthFooter
        eyebrow="Need help?"
        title="Beverly Group support"
        buttonLabel="Contact"
        onPress={() => router.push('/(auth)/profile')}
      />
    </View>
  );
}
