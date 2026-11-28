import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { Award, ChevronRight, CirclePlay, Search, Ship, ShieldCheck, Sparkles } from 'lucide-react-native';
import {
  AcademyEyebrow,
  AcademyGradient,
  AcademyPillTabs,
  AcademyScreenFrame,
} from './academy-ui';
import { EmptyState, QueryView } from '@/components/states';
import {
  courseSource,
  getAcademySummary,
  getCertificates,
  getCourses,
  type Course,
} from '@/lib/api/academy';

type AcademyHomeTab = 'In progress' | 'Catalog' | 'Certificates';

const matches = (course: Course, search: string) =>
  `${courseSource(course)} ${course.title}`.toLowerCase().includes(search.trim().toLowerCase());

export const formatAcademyDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function CourseRow({ course, index, onPress }: { course: Course; index: number; onPress: () => void }) {
  const CourseIcon = index % 2 === 0 ? Ship : Sparkles;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-2.5 min-h-[58px] flex-row items-center rounded-[13px] border border-[#E8EAF0] bg-white px-2.5 py-2"
    >
      <View className={`mr-2.5 h-8 w-8 items-center justify-center rounded-[10px] ${index % 2 === 0 ? 'bg-[#4145B6]' : 'bg-[#E8A20A]'}`}>
        <CourseIcon color="white" size={16} />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] font-bold tracking-[0.6px] text-[#737B8A]">{courseSource(course)}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[14px] font-medium text-[#202638]">{course.title}</Text>
        <Text className="mt-0.5 text-[14px] text-[#858C99]">{course.lessons} lessons · {course.duration} min · +{course.miles}</Text>
      </View>
      <ChevronRight color="#8790A0" size={16} />
    </Pressable>
  );
}

function CourseList({ courses, search, onOpen }: { courses: Course[]; search: string; onOpen: (id: string) => void }) {
  const visible = courses.filter((course) => matches(course, search));
  if (visible.length === 0) {
    return <Text className="py-6 text-center text-[12px] text-[#747C8D]">No courses match “{search}”.</Text>;
  }
  return (
    <>
      {visible.map((course, index) => (
        <CourseRow key={course._id} course={course} index={index} onPress={() => onOpen(course._id)} />
      ))}
    </>
  );
}

export function AcademyHomeScreen({
  onOpenCourse,
  onOpenCertificate,
  onVerify,
}: {
  onOpenCourse: (courseId: string) => void;
  onOpenCertificate: (courseId: string) => void;
  onVerify: () => void;
}) {
  const [tab, setTab] = useState<AcademyHomeTab>('In progress');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const summary = useQuery({ queryKey: ['academy', 'summary'], queryFn: getAcademySummary });
  const catalog = useQuery({ queryKey: ['academy', 'courses'], queryFn: () => getCourses() });
  const recommended = useQuery({ queryKey: ['academy', 'recommended'], queryFn: () => getCourses({ recommended: true }) });
  const certificates = useQuery({ queryKey: ['academy', 'certificates'], queryFn: getCertificates, enabled: tab === 'Certificates' });
  const sourceOf = (courseId: string) => {
    const course = catalog.data?.find((item) => item._id === courseId);
    return course ? courseSource(course) : 'WOWMILES';
  };

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
          <Text className="text-[47px] font-bold leading-[72px] text-white">
            {summary.data ? summary.data.milesEarned.toLocaleString('en-US') : '–'}
          </Text>
          <Text className="ml-1.5 text-[10px] text-white/75">miles</Text>
        </View>
        {summary.data ? (
          <Text className="text-[16px] text-white/70">
            {summary.data.lessonsCompleted} lessons complete · {summary.data.certificates} certificates
          </Text>
        ) : null}
      </AcademyGradient>

      <ScrollView className="flex-1 px-3 pt-3" contentContainerStyle={{ paddingBottom: 24 }}>
        <AcademyPillTabs
          tabs={['In progress', 'Catalog', 'Certificates']}
          selected={tab}
          onSelect={(value) => setTab(value as AcademyHomeTab)}
        />
        {tab === 'Certificates' ? (
          <View className="mt-4">
            <Pressable
              accessibilityRole="button"
              onPress={onVerify}
              className="mb-3 min-h-[44px] flex-row items-center justify-center rounded-full border border-[#E8EAF0] bg-white"
            >
              <ShieldCheck color="#4145B6" size={16} />
              <Text className="ml-2 text-[11px] font-semibold text-[#4145B6]">Verify a certificate</Text>
            </Pressable>
            <QueryView
              query={certificates}
              empty={<EmptyState title="No certificates yet" description="Complete a course to earn your first certificate." />}
            >
              {(items) => (
                <>
                  {items.map((item) => (
                    <View key={item.id} className="mb-3 rounded-[16px] border border-[#E8EAF0] bg-white p-4">
                      <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-[#FFF2D4]">
                        <Award color="#D28B00" size={20} />
                      </View>
                      <Text className="text-[13px] font-semibold text-[#202638]">{item.courseTitle}</Text>
                      <Text className="mt-1 text-[10px] text-[#747C8D]">{item.issuedBy.name} · {formatAcademyDate(item.issuedAt)}</Text>
                      {item.course ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => onOpenCertificate(item.course?._id ?? '')}
                          className="mt-3 flex-row items-center"
                        >
                          <Text className="text-[11px] font-semibold text-[#4145B6]">View certificate</Text>
                          <ChevronRight color="#4145B6" size={15} />
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </>
              )}
            </QueryView>
          </View>
        ) : tab === 'Catalog' ? (
          <>
            <View className="mb-2 mt-6">
              <AcademyEyebrow style={{ fontSize: 12, fontWeight: 'bold' }}>COURSE CATALOG</AcademyEyebrow>
            </View>
            <QueryView query={catalog} empty={<EmptyState title="No courses available" description="New courses will appear here." />}>
              {(items) => <CourseList courses={items} search={search} onOpen={onOpenCourse} />}
            </QueryView>
          </>
        ) : (
          <>
            <AcademyEyebrow style={{ marginTop: 24, fontSize: 12 }}>IN PROGRESS</AcademyEyebrow>
            <QueryView
              query={summary}
              isEmpty={(data) => data.inProgress.length === 0}
              empty={
                <View className="mt-2">
                  <EmptyState title="Nothing in progress" description="Pick a course from the catalog to get started." />
                </View>
              }
            >
              {(data) => (
                <>
                  {data.inProgress.map((item) => {
                    const percent = Math.round(item.completedRate);
                    return (
                      <Pressable
                        key={item.courseId}
                        accessibilityRole="button"
                        accessibilityLabel={`Resume ${item.title}`}
                        onPress={() => onOpenCourse(item.courseId)}
                        className="mt-2 overflow-hidden rounded-[16px] bg-white shadow-sm"
                        style={{ elevation: 2, marginTop: 8, borderRadius: 16, overflow: 'hidden' }}
                      >
                        <View className="mx-2.5 mt-5 rounded-[11px] bg-[#4145B6] px-2.5 py-2.5">
                          <View className="mb-2 flex-row items-center justify-between">
                            <Text className="text-[12px] font-semibold tracking-[0.7px] text-white/70">{sourceOf(item.courseId)}</Text>
                            <Text className="text-[14px] text-white/85">{percent}%</Text>
                          </View>
                          <Text numberOfLines={1} className="text-[14px] font-medium text-white">{item.title}</Text>
                          <View className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/25">
                            <View style={{ width: `${Math.min(100, percent)}%` }} className="h-full rounded-full bg-[#FFB91F]" />
                          </View>
                        </View>
                        <View className="flex-row items-center px-3 py-2">
                          <View className="flex-1">
                            <Text className="text-[13px] font-medium text-[#273042]">{percent}% complete</Text>
                            <Text className="mt-0.5 text-[12px] text-[#D28B00]">Last activity {formatAcademyDate(item.lastActivity)}</Text>
                          </View>
                          <View className="flex-row items-center rounded-full bg-[#4145B6] px-2.5 py-1.5">
                            <CirclePlay color="white" size={12} />
                            <Text className="ml-1 text-[12px] font-semibold text-white">Resume</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </>
              )}
            </QueryView>

            <View className="mb-2 mt-4 flex-row items-center justify-between">
              <AcademyEyebrow style={{ fontSize: 12, fontWeight: 'bold' }}>RECOMMENDED FOR YOU</AcademyEyebrow>
              <Pressable accessibilityRole="button" onPress={() => setTab('Catalog')}>
                <Text className="text-[12px] text-[#8A91A0]">View all</Text>
              </Pressable>
            </View>
            <QueryView query={recommended} empty={<EmptyState title="No recommendations right now" />}>
              {(items) => <CourseList courses={items} search={search} onOpen={onOpenCourse} />}
            </QueryView>
          </>
        )}
      </ScrollView>
    </AcademyScreenFrame>
  );
}
