import { AppContext } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IoniconsName, focused: boolean, color: string) {
  return <Ionicons name={focused ? name : (`${name}-outline` as IoniconsName)} size={22} color={color} />;
}

export default function TabLayout() {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!context) return;
    if (!context.isLoading && !context.currentUser) {
      router.replace('/login');
    }
  }, [context?.isLoading, context?.currentUser]);

  const dark = context?.darkMode ?? false;
  const tabBarBg = dark ? '#1E293B' : '#FFFFFF';
  const borderColor = dark ? '#334155' : '#E5E7EB';
  const inactiveColor = dark ? '#64748B' : '#9CA3AF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EA580C',
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Applications',
          tabBarIcon: ({ focused, color }) => tabIcon('briefcase', focused, color),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ focused, color }) => tabIcon('folder', focused, color),
        }}
      />
      <Tabs.Screen
        name="targets"
        options={{
          title: 'Targets',
          tabBarIcon: ({ focused, color }) => tabIcon('trophy', focused, color),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused, color }) => tabIcon('bar-chart', focused, color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => tabIcon('person', focused, color),
        }}
      />
    </Tabs>
  );
}
