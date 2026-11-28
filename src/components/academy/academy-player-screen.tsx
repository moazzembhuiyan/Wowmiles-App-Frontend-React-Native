import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { CircleHelp, Info, Pause, Play, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AcademyActionBar, AcademyScreenFrame, AcademyStatusFrame, ScrollContent } from './academy-ui';
import { ErrorState, LoadingState } from '@/components/states';
import { getLessons, type Lesson } from '@/lib/api/academy';

export function AcademyPlayerScreen({
  courseId,
  lessonId,
  onClose,
  onComplete,
  onStartQuiz,
}: {
  courseId: string;
  lessonId: string;
  onClose: () => void;
  onComplete: (lesson: Lesson) => Promise<void>;
  onStartQuiz: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const lessonsQuery = useQuery({ queryKey: ['academy', 'lessons', courseId], queryFn: () => getLessons(courseId) });
  const lesson = lessonsQuery.data?.items.find((item) => item.id === lessonId);

  if (!lesson || !lessonsQuery.data) {
    return (
      <AcademyStatusFrame onBack={onClose}>
        {lessonsQuery.isError || lessonsQuery.data ? (
          <ErrorState
            message={lessonsQuery.isError ? lessonsQuery.error.message : 'This lesson is no longer available.'}
            onRetry={() => void lessonsQuery.refetch()}
          />
        ) : (
          <LoadingState />
        )}
      </AcademyStatusFrame>
    );
  }

  const isQuiz = lesson.type === 'quiz';
  const remaining = lesson.total - lesson.index;
  const togglePlayback = () => {
    setPlaying((current) => !current);
    if (!playing && lesson.media) void Linking.openURL(lesson.media).catch(() => setPlaying(false));
  };

  return (
    <AcademyScreenFrame background="#111522">
      <StatusBar style="light" />
      <View className="bg-[#111522] px-3 pb-[76px] pt-1">
        <View className="mb-3 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close course player"
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <X color="white" size={17} />
          </Pressable>
          <Text className="text-[9px] font-medium text-white">Lesson {lesson.index} of {lesson.total}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Course information" className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Info color="white" size={15} />
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'Pause lesson' : 'Play lesson'} onPress={togglePlayback}>
          <LinearGradient
            colors={['#171D2C', '#353C51']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 204, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
          >
            <View className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10" />
            <View className="absolute -right-2 -top-2 h-28 w-28 rounded-full border border-white/10" />
            <View className="h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15">
              {playing ? <Pause color="white" size={18} /> : <Play color="white" size={18} fill="white" />}
            </View>
          </LinearGradient>
        </Pressable>
        <View className="mt-2 h-[3px] rounded-full bg-white/20">
          <View className={`h-full rounded-full bg-[#FFB91F] ${lesson.isCompleted ? 'w-full' : 'w-0'}`} />
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text className="text-[8px] text-white/55">0:00</Text>
          <Text className="text-[8px] text-white/55">{lesson.duration} min</Text>
        </View>
      </View>

      <View className="-mt-1 flex-1 overflow-hidden rounded-t-[21px] bg-[#F7F8FA]">
        <ScrollContent className="px-3 pt-3">
          <Text className="text-[18px] font-bold leading-[23px] text-[#202638]">{lesson.title}</Text>
          <Text className="mt-1 text-[10px] leading-[16px] text-[#747C8D]">
            {lesson.moduleTitle} · {lesson.type} · {lesson.duration} min
          </Text>
          {lesson.keyTopics?.length ? (
            <View className="mt-2">
              {lesson.keyTopics.map((topic) => (
                <Text key={topic} className="mt-0.5 text-[10px] leading-[16px] text-[#747C8D]">• {topic}</Text>
              ))}
            </View>
          ) : null}
          <View className="mt-3 flex-row items-start rounded-[12px] bg-[#FFF7E8] px-2.5 py-2.5">
            <CircleHelp color="#D28B00" size={14} />
            <Text className="ml-2 flex-1 text-[9px] leading-[14px] text-[#624C24]">
              {isQuiz ? `Pass with ${lesson.passMark ?? 80}% to complete this lesson. Miles are awarded once, when the course is complete.` : 'Finish every lesson and pass the quiz to earn the course miles, awarded once.'}
            </Text>
          </View>
          <View className="mt-4 flex-row items-center">
            <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#E9EBF4]">
              <Info color="#4145B6" size={14} />
            </View>
            <Text className="text-[9px] text-[#747C8D]">{lesson.moduleTitle}</Text>
          </View>
        </ScrollContent>
        <AcademyActionBar
          eyebrow={`LESSON ${lesson.index} OF ${lesson.total}`}
          title={`${remaining} remaining after this`}
          actionLabel={isQuiz ? (lesson.isCompleted ? 'Retake quiz' : 'Start quiz') : lesson.isCompleted ? 'Next' : 'Mark complete'}
          disabled={saving}
          onPress={() => {
            if (isQuiz) {
              onStartQuiz();
              return;
            }
            setSaving(true);
            void onComplete(lesson).finally(() => setSaving(false));
          }}
        />
      </View>
    </AcademyScreenFrame>
  );
}
