import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { db } from '@/db/client';
import { applications as applicationsTable, categories as categoriesTable, sessions as sessionsTable, settings as settingsTable, users as usersTable } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { eq } from 'drizzle-orm';

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

export type Application = {
  id: number;
  company: string;
  role: string;
  date: string;
  status: string;
  categoryId: number;
  notes: string | null;
};

type AppContextType = {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      await seedIfEmpty();

      const apps = await db.select().from(applicationsTable);
      const cats = await db.select().from(categoriesTable);
      setApplications(apps);
      setCategories(cats as Category[]);

      const settingRows = await db.select().from(settingsTable).where(eq(settingsTable.key, 'darkMode'));
      if (settingRows.length > 0) setDarkMode(settingRows[0].value === 'true');

      const sessionRows = await db.select().from(sessionsTable);
      if (sessionRows.length > 0) {
        const userRows = await db.select().from(usersTable).where(eq(usersTable.id, sessionRows[0].userId));
        if (userRows.length > 0) setCurrentUser(userRows[0]);
      }

      setIsLoading(false);
    };

    void load();
  }, []);

  return (
    <AppContext.Provider value={{
      applications, setApplications,
      categories, setCategories,
      currentUser, setCurrentUser,
      isLoading,
      darkMode, setDarkMode,
    }}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: 'Add Application', headerBackTitle: 'Back' }} />
        <Stack.Screen name="application/[id]" options={{ title: 'Application', headerBackTitle: 'Back' }} />
        <Stack.Screen name="application/[id]/edit" options={{ title: 'Edit Application', headerBackTitle: 'Back' }} />
        <Stack.Screen name="application/[id]/status" options={{ title: 'Update Status', headerBackTitle: 'Back' }} />
        <Stack.Screen name="category/add" options={{ title: 'Add Category', headerBackTitle: 'Back' }} />
        <Stack.Screen name="category/[id]/edit" options={{ title: 'Edit Category', headerBackTitle: 'Back' }} />
        <Stack.Screen name="target/add" options={{ title: 'Add Target', headerBackTitle: 'Back' }} />
      </Stack>
    </AppContext.Provider>
  );
}
