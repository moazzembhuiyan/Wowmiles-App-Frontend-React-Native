import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CircleX } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { AuthFooter, AuthHero } from '@/components/figma-auth';
import { fetchKycDetail } from '@/lib/api/auth';

function stepDate(iso: string | null | undefined) {
  if (!iso) return '';
  const at = new Date(iso);
  const day = at.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${day} · ${at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
}

export default function VerificationRejectedScreen() {
  const kyc = useQuery({ queryKey: ['kyc', 'me'], queryFn: fetchKycDetail });
  // `needs_document` means the document could not be read: the agent uploads a clearer one and resubmits.
  const needsDocument = kyc.data?.status === 'needs_document';
  const note = needsDocument ? kyc.data?.reviewNote : kyc.data?.rejectedReason;
  const submitted = kyc.data?.steps.find((step) => step.key === 'submitted');
  const review = kyc.data?.steps.find((step) => step.key === 'review');

  return (
    <View className="w-full max-w-[440px] flex-1 self-center bg-[#F8F9FB]">
      <AuthHero className="h-[270px] overflow-hidden px-5 pt-8">
        <View className="mb-4 h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <CircleX color="#FFE2E2" size={16} strokeWidth={1.8} />
        </View>
        <Text className="text-[20px] font-bold leading-[25px] text-white">
          {needsDocument ? 'We need a clearer document' : 'We could not verify your agency'}
        </Text>
        <Text className="mt-2 text-[13px] leading-[19px] text-[#F0D8DB]">
          {needsDocument
            ? 'We could not read the document you uploaded. Upload a clearer copy and resubmit.'
            : 'We could not match your details. Review the information and resubmit.'}
        </Text>
      </AuthHero>
      <View className="-mt-5 flex-1 rounded-t-[20px] bg-[#F8F9FB] px-5 pt-5">
        <View className="rounded-[13px] border border-[#F0D4D4] bg-white p-3">
          <Text className="text-[12px] font-bold tracking-[0.5px] text-[#B84444]">REVIEW NOTES</Text>
          <Text className="mt-1.5 text-[12px] leading-[18px] text-[#646B7A]">
            {kyc.isPending ? 'Loading the review notes…' : note || 'No notes were left. Check your details and resubmit.'}
          </Text>
        </View>
        <Text className="mb-2 mt-4 text-[12px] font-semibold tracking-[0.7px] text-[#72798A]">PROGRESS</Text>
        <View className="rounded-[13px] bg-white px-4 py-3">
          <Text className="text-[13px] font-medium text-[#252A38]">✓  Details submitted</Text>
          <Text className="mb-3 mt-0.5 pl-5 text-[12px] text-[#858A96]">{stepDate(submitted?.at)}</Text>
          <Text className="text-[13px] font-medium text-[#B84444]">{needsDocument ? '!  Document unclear' : '×  Agency review'}</Text>
          <Text className="mt-0.5 pl-5 text-[12px] text-[#858A96]">{stepDate(review?.at)}</Text>
        </View>
      </View>
      <AuthFooter
        eyebrow="What to do next"
        title="Review and submit again"
        buttonLabel="Update"
        onPress={() => router.replace('/(auth)/agency')}
      />
    </View>
  );
}
