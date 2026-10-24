import { Tabs } from 'expo-router';
import { Award, CalendarDays, House, TicketCheck, UserRound } from 'lucide-react-native';

const tabs = [
  { name: 'index', title: 'Home', Icon: House },
  { name: 'bookings', title: 'Bookings', Icon: TicketCheck },
  { name: 'academy', title: 'Academy', Icon: Award },
  { name: 'events', title: 'Events', Icon: CalendarDays },
  { name: 'profile', title: 'Profile', Icon: UserRound },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4145B6',
        tabBarInactiveTintColor: '#8A91A0',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 3 },
        tabBarStyle: {
          height: 82,
          paddingTop: 9,
          paddingBottom: 17,
          borderTopColor: '#E9EBF1',
          backgroundColor: '#FFFFFF',
          elevation: 0,
        },
      }}
    >
      {tabs.map(({ name, title, Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, focused }) => (
              <Icon color={color} size={21} strokeWidth={focused ? 2.2 : 1.8} />
            ),
          }}
        />
      ))}
      <Tabs.Screen name="miles" options={{ href: "/miles" }} />
      <Tabs.Screen name="history" options={{ href: "/history" }} />
      <Tabs.Screen name="loyalty" options={{ href: "/loyalty" }} />
      <Tabs.Screen name="tier-benefits" options={{ href: "/tier-benefits" }} />
      <Tabs.Screen name="notifications" options={{ href: "/notifications" }} />
      <Tabs.Screen name="notification-detail" options={{ href: "/notification-detail" }} />
    </Tabs>
  );
}
