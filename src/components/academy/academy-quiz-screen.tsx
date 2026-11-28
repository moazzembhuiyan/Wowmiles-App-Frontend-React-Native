import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AcademyActionBar, AcademyScreenFrame, AcademyStatusFrame } from './academy-ui';
import { ErrorState, LoadingState } from '@/components/states';
import { useToast } from '@/components/toast';
import { getLessons, getQuiz, submitQuiz, type Lesson, type QuizAttempt } from '@/lib/api/academy';
import { ApiError } from '@/lib/api/client';

export function AcademyQuizScreen({
  courseId,
  lessonId,
  onSubmitted,
  onClose,
}: {
  courseId: string;
  lessonId: string;
  onSubmitted: (attempt: QuizAttempt, lesson: Lesson) => void;
  onClose: () => void;
}) {
  const showToast = useToast();
  const [startedAt] = useState(() => Date.now());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const lessonsQuery = useQuery({ queryKey: ['academy', 'lessons', courseId], queryFn: () => getLessons(courseId) });
  const lesson = lessonsQuery.data?.items.find((item) => item.id === lessonId);
  // Fresh every time: the attempts left and the question set change after each attempt.
  const quizQuery = useQuery({
    queryKey: ['academy', 'quiz', lessonId],
    queryFn: () => getQuiz({ id: lessonId }),
    staleTime: 0,
    gcTime: 0,
  });
  const submit = useMutation({
    mutationFn: (input: { lesson: Lesson; answers: { question: string; selectedOption: string }[] }) =>
      submitQuiz({
        lesson: input.lesson,
        answers: input.answers,
        timeTaken: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      }),
    onSuccess: (attempt, input) => onSubmitted(attempt, input.lesson),
    onError: (error) => showToast('Could not submit quiz', error instanceof ApiError ? error.message : 'Please try again.', 'error'),
  });

  const quiz = quizQuery.data;
  if (!quiz || !lesson) {
    const error = quizQuery.error ?? lessonsQuery.error;
    return (
      <AcademyStatusFrame onBack={onClose}>
        {error ? (
          <ErrorState
            message={error.message}
            onRetry={() => {
              void quizQuery.refetch();
              void lessonsQuery.refetch();
            }}
          />
        ) : (
          <LoadingState />
        )}
      </AcademyStatusFrame>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <AcademyStatusFrame onBack={onClose}>
        <ErrorState message="This quiz has no questions yet." />
      </AcademyStatusFrame>
    );
  }

  const question = quiz.questions[questionIndex];
  const selected = answers[question.id] ?? null;
  const isLast = questionIndex === quiz.questions.length - 1;

  const onNext = () => {
    if (selected === null) return;
    if (!isLast) {
      setQuestionIndex((current) => current + 1);
      return;
    }
    submit.mutate({
      lesson,
      answers: quiz.questions.map((q) => ({ question: q.id, selectedOption: answers[q.id] })),
    });
  };

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
          <Text className="text-[10px] font-medium text-[#273042]">Question {questionIndex + 1} of {quiz.questions.length}</Text>
          <View className="h-9 w-9" />
        </View>
        <View className="mb-5 h-[3px] overflow-hidden rounded-full bg-[#E4E6EC]">
          <View style={{ width: `${((questionIndex + 1) / quiz.questions.length) * 100}%` }} className="h-full rounded-full bg-[#4145B6]" />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="mb-4 text-[18px] font-bold leading-[23px] text-[#202638]">{question.title}</Text>
          {question.options.map((choice, index) => {
            const active = selected === choice.key;
            return (
              <Pressable
                key={choice.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setAnswers((current) => ({ ...current, [question.id]: choice.key }))}
                className={`mb-2 min-h-[44px] flex-row items-center rounded-[12px] border px-2.5 py-2 ${
                  active ? 'border-[#4145B6] bg-[#F0F1FB]' : 'border-[#E6E8EE] bg-white'
                }`}
              >
                <View className={`mr-2.5 h-[18px] w-[18px] items-center justify-center rounded-full ${
                  active ? 'bg-[#4145B6]' : 'bg-[#F1F2F6]'
                }`}>
                  <Text className={`text-[9px] font-medium ${active ? 'text-white' : 'text-[#626A79]'}`}>{String.fromCharCode(65 + index)}</Text>
                </View>
                <Text className={`flex-1 text-[11px] leading-[16px] ${active ? 'font-medium text-[#303748]' : 'text-[#454D5D]'}`}>{choice.text}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <AcademyActionBar
        eyebrow={`${quiz.attemptsRemaining} ATTEMPTS LEFT`}
        title={selected === null ? 'Select one answer' : 'Answer selected'}
        actionLabel={isLast ? 'Submit' : 'Next'}
        disabled={selected === null || submit.isPending}
        onPress={onNext}
      />
    </AcademyScreenFrame>
  );
}
