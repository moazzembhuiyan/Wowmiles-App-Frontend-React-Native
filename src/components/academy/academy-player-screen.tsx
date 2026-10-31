import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CircleHelp, Info, Pause, Play, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { courseModules, featuredCourse } from './academy-data';
import { AcademyActionBar, AcademyScreenFrame, ScrollContent } from './academy-ui';

export function AcademyPlayerScreen({
  moduleIndex,
  onClose,
  onComplete,
}: {
  moduleIndex: number;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const lesson = courseModules[moduleIndex];

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
          <Text className="text-[9px] font-medium text-white">Module {moduleIndex + 1} of 6</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Course information" className="h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <Info color="white" size={15} />
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={playing ? 'Pause lesson' : 'Play lesson'} onPress={() => setPlaying((current) => !current)}>
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
          <View className="h-full w-[42%] rounded-full bg-[#FFB91F]" />
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text className="text-[8px] text-white/55">3:52</Text>
          <Text className="text-[8px] text-white/55">10:04</Text>
        </View>
      </View>

      <View className="-mt-1 flex-1 overflow-hidden rounded-t-[21px] bg-[#F7F8FA]">
        <ScrollContent className="px-3 pt-3">
          <Text className="text-[18px] font-bold leading-[23px] text-[#202638]">{lesson.title}</Text>
          <Text className="mt-1 text-[10px] leading-[16px] text-[#747C8D]">
            The three objections agents hear most: is it not much better than Economy, the price gap is too wide, and my client will wait for a Business sale. Each is answered with a concrete comparison.
          </Text>
          <View className="mt-3 flex-row items-start rounded-[12px] bg-[#FFF7E8] px-2.5 py-2.5">
            <CircleHelp color="#D28B00" size={14} />
            <Text className="ml-2 flex-1 text-[9px] leading-[14px] text-[#624C24]">
              Finish all 6 modules and pass the quiz to earn 300 miles, awarded once.
            </Text>
          </View>
          <View className="mt-4 flex-row items-center">
            <View className="mr-2 h-7 w-7 items-center justify-center rounded-full bg-[#E9EBF4]">
              <Info color="#4145B6" size={14} />
            </View>
            <Text className="text-[9px] text-[#747C8D]">{featuredCourse.partner} · {featuredCourse.title}</Text>
          </View>
        </ScrollContent>
        <AcademyActionBar
          eyebrow={`MODULE ${moduleIndex + 1} OF 6`}
          title={`${5 - moduleIndex} remaining after this`}
          actionLabel="Mark complete"
          onPress={onComplete}
        />
      </View>
    </AcademyScreenFrame>
  );
}
