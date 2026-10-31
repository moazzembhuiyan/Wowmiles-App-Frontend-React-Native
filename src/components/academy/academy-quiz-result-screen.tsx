import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Award, CircleCheck } from 'lucide-react-native';
import { certificateTopics, featuredCourse } from './academy-data';
import {
  AcademyActionBar,
  AcademyEyebrow,
  AcademyScreenFrame,
  academyColors,
} from './academy-ui';

export function AcademyQuizResultScreen({
  score,
  onAction,
}: {
  score: number;
  onAction: () => void;
}) {
  const passed = score >= 4;
  return (
    <AcademyScreenFrame>
      <StatusBar style="light" />
      <View className="h-[340px] overflow-hidden bg-[#08714F] px-4 pb-5 pt-4">
        <View className="absolute -right-10 -top-20 h-[210px] w-[210px] rounded-full border border-white/10" />
        <View className="absolute -right-4 -top-14 h-[165px] w-[165px] rounded-full border border-white/10" />
        <View className="absolute right-4 -top-7 h-[120px] w-[120px] rounded-full border border-white/10" />
        <View className="flex-1 justify-end">
          <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-white/25">
            <CircleCheck color="white" size={18} />
          </View>
          <Text className="text-[27px] font-bold leading-[32px] text-white">{passed ? 'You passed' : 'Keep learning'}</Text>
          <View className="mt-1 flex-row items-baseline">
            <Text className="text-[15px] font-semibold text-white">{score}</Text>
            <Text className="ml-1 text-[9px] text-white/75">of 5 correct · 4 needed to pass</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-3 pt-3">
        {passed ? (
          <View className="mb-3 min-h-[50px] flex-row items-center rounded-[12px] bg-[#FFF7E8] px-3">
            <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-full bg-[#FFB91F]">
              <Award color="#202638" size={15} />
            </View>
            <View>
              <Text className="text-[7px] font-semibold tracking-[0.6px] text-[#A36A00]">CREDITED JUST NOW</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-[#202638]">+{featuredCourse.rewardMiles} <Text className="font-normal text-[#747C8D]">WowMiles</Text></Text>
            </View>
          </View>
        ) : null}
        <AcademyEyebrow>KEY TOPICS</AcademyEyebrow>
        <View className="mt-1">
          {certificateTopics.map((topic, index) => (
            <View key={topic} className="min-h-[40px] flex-row items-center border-b border-[#E8EAF0] py-2">
              <CircleCheck color={academyColors.green} size={14} />
              <View className="ml-2 flex-1">
                <Text className="text-[10px] font-medium text-[#273042]">{topic}</Text>
                {!passed && index === 1 ? (
                  <Text className="mt-1 text-[9px] leading-[13px] text-[#747C8D]">Review the course modules and try the knowledge check again.</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>

      <AcademyActionBar
        eyebrow={passed ? 'CERTIFICATE ISSUED' : 'QUIZ NOT PASSED'}
        title={passed ? featuredCourse.certificate : 'You need 4 correct answers'}
        actionLabel={passed ? 'View' : 'Retry'}
        onPress={onAction}
      />
    </AcademyScreenFrame>
  );
}
