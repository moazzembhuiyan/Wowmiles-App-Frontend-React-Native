import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Download, ChevronLeft } from 'lucide-react-native';
import { AcademyGradient, AcademyScreenFrame, AcademyStatusFrame, CertificateSeal } from './academy-ui';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { getCertificateForCourse, type Certificate } from '@/lib/api/academy';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export function AcademyCertificateScreen({
  courseId,
  onBack,
  onLoaded,
  onDownload,
}: {
  courseId: string;
  onBack: () => void;
  onLoaded: (certificate: Certificate | null) => void;
  onDownload: () => void;
}) {
  const query = useQuery({
    queryKey: ['academy', 'certificate', courseId],
    queryFn: () => getCertificateForCourse(courseId),
  });
  const certificate = query.data ?? null;
  useEffect(() => {
    onLoaded(certificate);
  }, [certificate, onLoaded]);

  if (!certificate) {
    return (
      <AcademyStatusFrame onBack={onBack}>
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
        ) : query.isPending ? (
          <LoadingState />
        ) : (
          <EmptyState title="No certificate yet" description="Complete the course to earn your certificate." />
        )}
      </AcademyStatusFrame>
    );
  }

  return (
    <AcademyScreenFrame background="#252A70">
      <StatusBar style="light" />
      <AcademyGradient className="px-4 pb-8 pt-2" style={{ flex: 1 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Academy"
          onPress={onBack}
          className="mb-32 h-9 w-9 items-center justify-center rounded-full bg-white/20"
        >
          <ChevronLeft color="white" size={20} />
        </Pressable>

        <View
          className="mx-8 mt-1 items-center rounded-[18px] bg-white px-4 pb-5 pt-7"
          style={{ minHeight: 380, justifyContent: 'space-between' }}
        >
          <CertificateSeal />
          <Text className="mt-2 text-[7px] font-semibold tracking-[0.7px] text-[#737B8A]">CERTIFIED BY {certificate.issuedBy.name.toUpperCase()}</Text>
          <Text className="mt-3 text-center text-[15px] font-bold leading-[19px] text-[#202638]">
            {certificate.courseTitle}
          </Text>
          <View className="my-3 h-px w-full bg-[#E8EAF0]" />
          <Text className="text-[11px] font-medium text-[#202638]">{certificate.nameOnCertificate}</Text>
          {certificate.agencyName ? <Text className="mt-1 text-[8px] text-[#747C8D]">{certificate.agencyName}</Text> : null}
          <View className="mt-3 w-full flex-row justify-between px-1">
            <View className="items-center">
              <Text className="text-[7px] font-semibold tracking-[0.5px] text-[#8A91A0]">ISSUED</Text>
              <Text className="mt-1 text-[8px] text-[#303748]">{formatDate(certificate.issuedAt)}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[7px] font-semibold tracking-[0.5px] text-[#8A91A0]">REFERENCE</Text>
              <Text className="mt-1 text-[8px] text-[#303748]">{certificate.publicId}</Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onDownload}
          className="min-h-[42px] flex-row items-center justify-center rounded-full bg-[#FFB91F]"
          style={{ marginTop: 120 }}
        >
          <Download color="#171923" size={15} />
          <Text className="ml-2 text-[11px] font-semibold text-[#171923]">Download PDF</Text>
        </Pressable>
      </AcademyGradient>
    </AcademyScreenFrame>
  );
}
