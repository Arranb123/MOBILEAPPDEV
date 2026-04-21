import { AppContext } from '@/app/_layout';
import { Tabs, useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';

export default function TabLayout() {
  const context = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (!context) return;
    if (!context.isLoading && !context.currentUser) {
      router.replace('/login');
    }
  }, [context?.isLoading, context?.currentUser]);

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Applications' }} />
      <Tabs.Screen name="categories" options={{ title: 'Categories' }} />
      <Tabs.Screen name="targets" options={{ title: 'Targets' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
