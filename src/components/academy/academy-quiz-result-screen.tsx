import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Award, CircleCheck } from 'lucide-react-native';
import type { CourseCompletion, Lesson, QuizAttempt } from '@/lib/api/academy';
import {
  AcademyActionBar,
  AcademyEyebrow,
  AcademyScreenFrame,
  academyColors,
} from './academy-ui';

export function AcademyQuizResultScreen({
  attempt,
  lesson,
  completion,
  onAction,
}: {
  attempt: QuizAttempt;
  lesson: Lesson;
  completion: CourseCompletion | null;
  onAction: () => void;
}) {
  const passed = attempt.isPassed;
  const correct = attempt.answers.filter((answer) => answer.isCorrect).length;
  const topics = passed
    ? (lesson.keyTopics ?? []).map((topic) => ({ text: topic, hint: undefined as string | undefined }))
    : attempt.answers
        .filter((answer) => !answer.isCorrect)
        .map((answer) => ({ text: answer.questionTitle, hint: answer.explanation }));
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
            <Text className="text-[15px] font-semibold text-white">{correct}</Text>
            <Text className="ml-1 text-[9px] text-white/75">of {attempt.answers.length} correct · {attempt.passMark}% needed to pass</Text>
          </View>
        </View>
      </View>

      <View className="flex-1 px-3 pt-3">
        {passed && completion ? (
          <View className="mb-3 min-h-[50px] flex-row items-center rounded-[12px] bg-[#FFF7E8] px-3">
            <View className="mr-2.5 h-7 w-7 items-center justify-center rounded-full bg-[#FFB91F]">
              <Award color="#202638" size={15} />
            </View>
            <View>
              <Text className="text-[7px] font-semibold tracking-[0.6px] text-[#A36A00]">CREDITED JUST NOW</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-[#202638]">+{completion?.milesAwarded ?? 0} <Text className="font-normal text-[#747C8D]">WowMiles</Text></Text>
            </View>
          </View>
        ) : null}
        {topics.length > 0 ? <AcademyEyebrow>{passed ? 'KEY TOPICS' : 'REVIEW THESE'}</AcademyEyebrow> : null}
        <View className="mt-1">
          {topics.map((topic) => (
            <View key={topic.text} className="min-h-[40px] flex-row items-center border-b border-[#E8EAF0] py-2">
              <CircleCheck color={academyColors.green} size={14} />
              <View className="ml-2 flex-1">
                <Text className="text-[10px] font-medium text-[#273042]">{topic.text}</Text>
                {topic.hint ? (
                  <Text className="mt-1 text-[9px] leading-[13px] text-[#747C8D]">{topic.hint}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>

      <AcademyActionBar
        eyebrow={passed ? (completion?.certificate ? 'CERTIFICATE ISSUED' : 'QUIZ PASSED') : 'QUIZ NOT PASSED'}
        title={passed ? lesson.title : `You need ${attempt.passMark}% to pass`}
        actionLabel={passed ? (completion?.certificate ? 'View' : 'Continue') : 'Retry'}
        onPress={onAction}
      />
    </AcademyScreenFrame>
  );
}
