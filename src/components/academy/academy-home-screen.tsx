import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Award, ChevronRight, CirclePlay, Search, Ship, Sparkles } from 'lucide-react-native';
import {
  AcademyEyebrow,
  AcademyGradient,
  AcademyPillTabs,
  AcademyScreenFrame,
} from './academy-ui';
import { featuredCourse, recommendedCourses } from './academy-data';

type AcademyHomeTab = 'In progress' | 'Catalog' | 'Certificates';

export function AcademyHomeScreen({
  courseCompleted,
  onResume,
  onOpenCertificate,
  onUnavailable,
}: {
  courseCompleted: boolean;
  onResume: () => void;
  onOpenCertificate: () => void;
  onUnavailable: (courseTitle: string) => void;
}) {
  const [tab, setTab] = useState<AcademyHomeTab>('In progress');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const visibleRecommendations = useMemo(
    () => recommendedCourses.filter((course) => `${course.partner} ${course.title}`.toLowerCase().includes(search.trim().toLowerCase())),
    [search],
  );

  return (
    <AcademyScreenFrame>
      <StatusBar style="light" />
      <AcademyGradient className="!px-5 pb-4 pt-4" style={{ height: 250,padding: 12 }}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-white/85">Academy</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={searchOpen ? 'Close course search' : 'Search courses'}
            onPress={() => {
              setSearchOpen((open) => !open);
              setSearch('');
            }}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <Search color="white" size={16} />
          </Pressable>
        </View>
        {searchOpen ? (
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses"
            placeholderTextColor="rgba(255,255,255,0.65)"
            autoFocus
            className="mb-2 h-9 rounded-full border border-white/25 bg-white/10 px-3 text-[12px] text-white"
          />
        ) : null}
        <AcademyEyebrow style={{ marginTop: 24, fontSize: 12 }}>MILES FROM TRAINING</AcademyEyebrow>
        <View className="mt-1 flex-row items-baseline">
          <Text className="text-[47px] font-bold leading-[72px] text-white">{courseCompleted ? '1,800' : '1,500'}</Text>
          <Text className="ml-1.5 text-[10px] text-white/75">miles</Text>
        </View>
        <Text className="text-[16px] text-white/70">
          {courseCompleted ? '14 of 14 modules complete · 4 certificates' : '9 of 14 modules complete · 3 certificates'}
        </Text>
      </AcademyGradient>

      <View className="flex-1 px-3 pt-3">
        <AcademyPillTabs
          tabs={['In progress', 'Catalog', 'Certificates']}
          selected={tab}
          onSelect={(value) => setTab(value as AcademyHomeTab)}
        />
        {tab === 'Certificates' ? (
          <View className="mt-4 rounded-[16px] border border-[#E8EAF0] bg-white p-4">
            <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFF2D4]">
              <Award color="#D28B00" size={20} />
            </View>
            <Text className="text-[13px] font-semibold text-[#202638]">{featuredCourse.title}</Text>
            <Text className="mt-1 text-[10px] text-[#747C8D]">Emirates · 14 Oct 2026</Text>
            <Pressable accessibilityRole="button" onPress={onOpenCertificate} className="mt-3 flex-row items-center">
              <Text className="text-[11px] font-semibold text-[#4145B6]">View certificate</Text>
              <ChevronRight color="#4145B6" size={15} />
            </Pressable>
          </View>
        ) : (
          <>
            {tab === 'Catalog' ? (
              <>
                <AcademyEyebrow style={{ marginTop: 24, fontSize: 12 }}>FEATURED COURSE</AcademyEyebrow>
                <Pressable
                  accessibilityRole="button"
                  onPress={onResume}
                  className="mt-2 flex-row items-center rounded-[13px] border border-[#E8EAF0] bg-white px-2.5 py-3"
                >
                  <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-[10px] bg-[#4145B6]">
                    <Award color="white" size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[8px] font-bold tracking-[0.6px] text-[#737B8A]">{featuredCourse.partner}</Text>
                    <Text className="mt-0.5 text-[11px] font-medium text-[#202638]">{featuredCourse.title}</Text>
                    <Text className="mt-0.5 text-[9px] text-[#858C99]">6 modules · {featuredCourse.duration} · +{featuredCourse.rewardMiles} miles</Text>
                  </View>
                  <ChevronRight color="#8790A0" size={16} />
                </Pressable>
              </>
            ) : null}
            {tab === 'In progress' ? (
              <>
                <AcademyEyebrow style={{ marginTop: 24, fontSize: 12 }}>
                  {courseCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                </AcademyEyebrow>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${courseCompleted ? 'View certificate for' : 'Resume'} ${featuredCourse.title}`}
                  onPress={courseCompleted ? onOpenCertificate : onResume}
                  className="mt-2 overflow-hidden rounded-[16px] bg-white shadow-sm"
                  style={{ elevation: 2, marginTop: 8, borderRadius: 16, overflow: 'hidden' }}
                >
                  <View className={`mx-2.5 mt-5 rounded-[11px] px-2.5 py-2.5 ${courseCompleted ? 'bg-[#08714F]' : 'bg-[#4145B6]'}`}>
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-[12px] font-semibold tracking-[0.7px] text-white/70">{featuredCourse.partner}</Text>
                      <Text className="text-[14px] text-white/85">{courseCompleted ? 'CERTIFICATE EARNED' : '50%'}</Text>
                    </View>
                    <Text numberOfLines={1} className="text-[14px] font-medium text-white">{featuredCourse.title}</Text>
                    <View className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/25">
                      <View className={`h-full rounded-full bg-[#FFB91F] ${courseCompleted ? 'w-full' : 'w-1/2'}`} />
                    </View>
                  </View>
                  <View className="flex-row items-center px-3 py-2">
                    <View className="flex-1">
                      <Text className="text-[13px] font-medium text-[#273042]">{courseCompleted ? 'Completed · Certificate issued' : 'Module 3 of 6'}</Text>
                      <Text className="mt-0.5 text-[12px] text-[#D28B00]">{courseCompleted ? featuredCourse.certificate : '+300 miles on completion'}</Text>
                    </View>
                    <View className={`flex-row items-center rounded-full px-2.5 py-1.5 ${courseCompleted ? 'bg-[#08714F]' : 'bg-[#4145B6]'}`}>
                      {courseCompleted ? <Award color="white" size={12} /> : <CirclePlay color="white" size={12} />}
                      <Text className="ml-1 text-[12px] font-semibold text-white">{courseCompleted ? 'View' : 'Resume'}</Text>
                    </View>
                  </View>
                </Pressable>
              </>
            ) : null}

            <View className="mb-2 mt-4 flex-row items-center justify-between">
              <AcademyEyebrow style={{ fontSize: 12, fontWeight: 'bold' }}>
                {tab === 'Catalog' ? 'COURSE CATALOG' : 'RECOMMENDED FOR YOU'}
              </AcademyEyebrow>
              {tab === 'In progress' ? <Text className="text-[12px] text-[#8A91A0]">View all</Text> : null}
            </View>
            {visibleRecommendations.map((course, index) => {
              const CourseIcon = index === 0 ? Ship : Sparkles;
              return (
                <Pressable
                  key={course.title}
                  accessibilityRole="button"
                  onPress={() => onUnavailable(course.title)}
                  className="mb-2.5 min-h-[58px] flex-row items-center rounded-[13px] border border-[#E8EAF0] bg-white px-2.5 py-2"
                >
                  <View className={`mr-2.5 h-8 w-8 items-center justify-center rounded-[10px] ${index === 0 ? 'bg-[#4145B6]' : 'bg-[#E8A20A]'}`}>
                    <CourseIcon color="white" size={16} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-bold tracking-[0.6px] text-[#737B8A]">{course.partner}</Text>
                    <Text numberOfLines={1} className="mt-0.5 text-[14px] font-medium text-[#202638]">{course.title}</Text>
                    <Text className="mt-0.5 text-[14px] text-[#858C99]">{course.details}</Text>
                  </View>
                  <ChevronRight color="#8790A0" size={16} />
                </Pressable>
              );
            })}
            {visibleRecommendations.length === 0 ? (
              <Text className="py-6 text-center text-[12px] text-[#747C8D]">No courses match “{search}”.</Text>
            ) : null}
          </>
        )}
      </View>
    </AcademyScreenFrame>
  );
}
