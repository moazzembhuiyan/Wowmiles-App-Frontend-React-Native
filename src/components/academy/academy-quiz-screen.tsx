import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AcademyActionBar, AcademyScreenFrame } from './academy-ui';
import { quizQuestions } from './academy-data';

export function AcademyQuizScreen({
  questionIndex,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onClose,
}: {
  questionIndex: number;
  selectedAnswer: number | null;
  onSelectAnswer: (answerIndex: number) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const question = quizQuestions[questionIndex];

  return (
    <AcademyScreenFrame background="#F7F8FA">
      <StatusBar style="dark" />
      <View className="flex-1 px-4 pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Exit quiz"
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full border border-[#E6E8EE] bg-white"
          >
            <Text className="text-[17px] leading-[20px] text-[#202638]">×</Text>
          </Pressable>
          <Text className="text-[10px] font-medium text-[#273042]">Question {questionIndex + 1} of 5</Text>
          <View className="h-9 w-9" />
        </View>
        <View className="mb-5 h-[3px] overflow-hidden rounded-full bg-[#E4E6EC]">
          <View style={{ width: `${((questionIndex + 1) / quizQuestions.length) * 100}%` }} className="h-full rounded-full bg-[#4145B6]" />
        </View>
        <Text className="mb-4 text-[18px] font-bold leading-[23px] text-[#202638]">{question.prompt}</Text>
        {question.choices.map((choice, index) => {
          const active = selectedAnswer === index;
          return (
            <Pressable
              key={choice}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => onSelectAnswer(index)}
              className={`mb-2 min-h-[44px] flex-row items-center rounded-[12px] border px-2.5 py-2 ${
                active ? 'border-[#4145B6] bg-[#F0F1FB]' : 'border-[#E6E8EE] bg-white'
              }`}
            >
              <View className={`mr-2.5 h-[18px] w-[18px] items-center justify-center rounded-full ${
                active ? 'bg-[#4145B6]' : 'bg-[#F1F2F6]'
              }`}>
                <Text className={`text-[9px] font-medium ${active ? 'text-white' : 'text-[#626A79]'}`}>{String.fromCharCode(65 + index)}</Text>
              </View>
              <Text className={`flex-1 text-[11px] leading-[16px] ${active ? 'font-medium text-[#303748]' : 'text-[#454D5D]'}`}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>
      <AcademyActionBar
        eyebrow="ANSWERED"
        title={selectedAnswer === null ? 'Select one answer' : 'Answer selected'}
        actionLabel="Next"
        disabled={selectedAnswer === null}
        onPress={onNext}
      />
    </AcademyScreenFrame>
  );
}
