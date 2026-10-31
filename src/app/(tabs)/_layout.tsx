import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, CalendarDays, House, TicketCheck, UserRound } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { TabBarVisibilityContext, useTabBarVisibility } from '@/components/tab-bar-visibility';

const tabs = [
  { name: 'index', title: 'Home', Icon: House },
  { name: 'bookings', title: 'Bookings', Icon: TicketCheck },
  { name: 'academy', title: 'Academy', Icon: Award },
  { name: 'events', title: 'Events', Icon: CalendarDays },
  { name: 'profile', title: 'Profile', Icon: UserRound },
] as const;

const SPRING = { damping: 18, stiffness: 20, mass: 0.6 };

type FloatingTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function TabItem({
  Icon,
  title,
  focused,
  onPress,
  onLongPress,
}: {
  Icon: (typeof tabs)[number]['Icon'];
  title: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const pillStyle = useAnimatedStyle(() => ({
    width: withSpring(focused ? 95 : 49, SPRING),
    backgroundColor: focused ? '#FFFFFF' : 'rgba(255,255,255,0)',
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: focused ? 220 : 80 }),
    maxWidth: withSpring(focused ? 48 : 0, SPRING),
    marginLeft: withSpring(focused ? 5 : 0, SPRING),
  }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={title}
    >
      <Animated.View
        style={[
          {
            height: 40,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          },
          pillStyle,
        ]}
      >
        <Icon color={focused ? '#111522' : '#FFFFFF'} size={18} strokeWidth={focused ? 2.2 : 1.8} />
        <Animated.View style={labelStyle}>
          <Text numberOfLines={1} style={{ fontSize: 12, fontWeight: '600', color: '#111522' }}>
            {title}
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function FloatingTabBar({ state, emitter, navigateToTab }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const setTabBarHidden = useTabBarVisibility();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: Math.max(insets.bottom, 8),
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          padding: 10,
          borderRadius: 30,
          backgroundColor: '#111522',
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const tab = tabs.find((t) => t.name === route.name);
          if (!tab) return null;
          const focused = state.index === index;

          const onPress = () => {
            setTabBarHidden(false);
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigateToTab(route.key);
            }
          };

          const onLongPress = () => {
            emitter.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              Icon={tab.Icon}
              title={tab.title}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const [tabBarHidden, setTabBarHidden] = useState(false);

  return (
    <TabBarVisibilityContext.Provider value={setTabBarHidden}>
      <Tabs
        tabBar={(props) => tabBarHidden ? null : <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          lazy: false,
          animation: 'fade',
        }}
      >
        {tabs.map(({ name, title }) => (
          <Tabs.Screen key={name} name={name} options={{ title }} />
        ))}
      </Tabs>
    </TabBarVisibilityContext.Provider>
  );
}