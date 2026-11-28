import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft } from 'lucide-react-native';
import {
  AcademyActionBar,
  AcademyEyebrow,
  AcademyGradient,
  AcademyScreenFrame,
  AcademyStatusFrame,
  ModuleProgressRow,
  ScrollContent,
} from './academy-ui';
import { ErrorState, LoadingState } from '@/components/states';
import { useToast } from '@/components/toast';
import { courseSource, enrol, getCourse, getLessons, type Lesson } from '@/lib/api/academy';
import { ApiError } from '@/lib/api/client';

const FORMAT_LABEL: Record<Lesson['type'], string> = {
  video: 'Video',
  article: 'Article',
  presentation: 'Presentation',
  document: 'Document',
  audio: 'Audio',
  quiz: 'Quiz',
};

export function AcademyCourseScreen({
  courseId,
  onBack,
  onOpenLesson,
  onOpenCertificate,
}: {
  courseId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenCertificate: () => void;
}) {
  const showToast = useToast();
  const courseQuery = useQuery({ queryKey: ['academy', 'course', courseId], queryFn: () => getCourse(courseId) });
  const lessonsQuery = useQuery({ queryKey: ['academy', 'lessons', courseId], queryFn: () => getLessons(courseId) });
  const enrolMutation = useMutation({
    mutationFn: () => enrol(courseId),
    onError: (error) => showToast('Could not enrol', error instanceof ApiError ? error.message : 'Please try again.', 'error'),
  });

  const failed = courseQuery.isError ? courseQuery : lessonsQuery.isError ? lessonsQuery : null;
  if (failed || !courseQuery.data || !lessonsQuery.data) {
    return (
      <AcademyStatusFrame onBack={onBack}>
        {failed ? (
          <ErrorState
            message={failed.error?.message}
            onRetry={() => {
              void courseQuery.refetch();
              void lessonsQuery.refetch();
            }}
          />
        ) : (
          <LoadingState />
        )}
      </AcademyStatusFrame>
    );
  }

  const course = courseQuery.data;
  const { items, completed, total } = lessonsQuery.data;
  const enrolled = course.myProgress.enrolled;
  const courseCompleted = course.myProgress.isComplete;
  const currentIndex = items.findIndex((lesson) => !lesson.isCompleted);
  const current = currentIndex >= 0 ? items[currentIndex] : null;
  const hasCertificate = course.certificate.enabled;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const onContinue = () => {
    if (courseCompleted) {
      onOpenCertificate();
      return;
    }
    if (!enrolled) {
      enrolMutation.mutate(undefined, {
        onSuccess: () => {
          const first = items[0];
          if (first) onOpenLesson(first.id);
        },
      });
      return;
    }
    if (current) onOpenLesson(current.id);
  };

  return (
    <AcademyScreenFrame >
      <StatusBar style="light" />
      <AcademyGradient className="px-4 pb-4 pt-2" style={{ height: 300 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Academy"
          onPress={onBack}
          className="h-9 w-9 items-center justify-center rounded-full bg-white/20"
        >
          <ChevronLeft color="white" size={20} />
        </Pressable>
        <View className="mt-4 flex-1 items-center justify-center">
          <View className="h-[46px] w-[46px] items-center justify-center rounded-[12px] border border-white/60 bg-white/10">
            <BookOpen color="white" size={23} strokeWidth={1.5} />
          </View>
        </View>
      </AcademyGradient>

      <ScrollContent className="bg-white">
        <View className="px-3 pt-3">
          <AcademyEyebrow>{courseSource(course)}</AcademyEyebrow>
          <Text className="mt-1 text-[23px] font-bold leading-[27px] text-[#202638]">
            {course.title}
          </Text>
          <View className="mt-2 flex-row items-center">
            <BookOpen color="#737B8A" size={12} />
            <Text className="ml-1 text-[13px] text-[#747C8D]">{total} lessons</Text>
            <Text className="mx-2 text-[13px] text-[#C2C6CE]">•</Text>
            <Text className="text-[13px] text-[#747C8D]">{course.duration} min</Text>
            <Text className="mx-2 text-[13px] text-[#C2C6CE]">•</Text>
            <Text className="text-[13px] font-medium text-[#D28B00]">+{course.miles} miles</Text>
          </View>

          <View className="mt-4">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-[14px] font-medium text-[#273042]">Your progress</Text>
              <Text className="text-[13px] text-[#858C99]">{completed} of {total} complete</Text>
            </View>
            <View className="h-[3px] overflow-hidden rounded-full bg-[#E4E6EC]">
              <View style={{ width: `${progressPercent}%` }} className="h-full rounded-full bg-[#4145B6]" />
            </View>
          </View>

          {course.description ? (
            <Text className="mt-4 text-[14px] leading-[20px] text-[#747C8D]">{course.description}</Text>
          ) : null}

          <AcademyEyebrow>MODULES</AcademyEyebrow>
          <View className="mt-1.5">
            {items.map((lesson, index) => {
              const state = lesson.isCompleted ? 'complete' : index === currentIndex ? 'current' : 'locked';
              return (
                <ModuleProgressRow
                  key={lesson.id}
                  title={lesson.title}
                  subtitle={`${FORMAT_LABEL[lesson.type]} · ${lesson.type === 'quiz' ? `${lesson.questions ?? 0} questions` : `${lesson.duration} min`}`}
                  state={courseCompleted ? 'complete' : state}
                  onPress={enrolled && state !== 'locked' ? () => onOpenLesson(lesson.id) : undefined}
                />
              );
            })}
          </View>
        </View>
      </ScrollContent>

      {courseCompleted && !hasCertificate ? null : (
        <AcademyActionBar
          eyebrow={courseCompleted ? 'COURSE COMPLETED' : enrolled ? 'UP NEXT' : 'NOT STARTED'}
          title={courseCompleted ? 'Certificate available' : current ? `Lesson ${currentIndex + 1} of ${total}` : 'Start this course'}
          actionLabel={courseCompleted ? 'View certificate' : enrolled ? 'Continue' : 'Enrol'}
          disabled={enrolMutation.isPending || (!courseCompleted && enrolled && !current)}
          onPress={onContinue}
        />
      )}
    </AcademyScreenFrame>
  );
}
