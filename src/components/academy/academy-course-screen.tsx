import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, ChevronLeft } from 'lucide-react-native';
import { featuredCourse, courseModules } from './academy-data';
import {
  AcademyActionBar,
  AcademyEyebrow,
  AcademyGradient,
  AcademyScreenFrame,
  ModuleProgressRow,
  ScrollContent,
} from './academy-ui';

export function AcademyCourseScreen({
  courseCompleted,
  onBack,
  onContinue,
  onSelectModule,
}: {
  courseCompleted: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSelectModule: (moduleIndex: number) => void;
}) {
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
          <AcademyEyebrow>{featuredCourse.partner}</AcademyEyebrow>
          <Text className="mt-1 text-[23px] font-bold leading-[27px] text-[#202638]">
            {featuredCourse.title}
          </Text>
          <View className="mt-2 flex-row items-center">
            <BookOpen color="#737B8A" size={12} />
            <Text className="ml-1 text-[13px] text-[#747C8D]">6 modules</Text>
            <Text className="mx-2 text-[13px] text-[#C2C6CE]">•</Text>
            <Text className="text-[13px] text-[#747C8D]">{featuredCourse.duration}</Text>
            <Text className="mx-2 text-[13px] text-[#C2C6CE]">•</Text>
            <Text className="text-[13px] font-medium text-[#D28B00]">+{featuredCourse.rewardMiles} miles</Text>
          </View>

          <View className="mt-4">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-[14px] font-medium text-[#273042]">Your progress</Text>
              <Text className="text-[13px] text-[#858C99]">{courseCompleted ? '6 of 6 complete' : '3 of 6 complete'}</Text>
            </View>
            <View className="h-[3px] overflow-hidden rounded-full bg-[#E4E6EC]">
              <View className={`h-full rounded-full bg-[#4145B6] ${courseCompleted ? 'w-full' : 'w-1/2'}`} />
            </View>
          </View>

          <Text className="mt-4 text-[14px] leading-[20px] text-[#747C8D]">
            How Emirates positions Premium Economy against Business, which routes carry the cabin, and the three objections agents hear most.
          </Text>

          <AcademyEyebrow>MODULES</AcademyEyebrow>
          <View className="mt-1.5">
            {courseModules.map((module, index) => (
              <ModuleProgressRow
                key={module.title}
                title={module.title}
                subtitle={`${module.format} · ${module.duration}`}
                state={courseCompleted ? 'complete' : module.status}
                onPress={!courseCompleted && module.status === 'current' ? () => onSelectModule(index) : undefined}
              />
            ))}
          </View>
        </View>
      </ScrollContent>

      <AcademyActionBar
        eyebrow={courseCompleted ? 'COURSE COMPLETED' : 'UP NEXT'}
        title={courseCompleted ? 'Certificate available' : 'Module 4 of 6'}
        actionLabel={courseCompleted ? 'View certificate' : 'Continue'}
        onPress={onContinue}
      />
    </AcademyScreenFrame>
  );
}