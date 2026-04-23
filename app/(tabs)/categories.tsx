import CategoryCard from '@/components/CategoryCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

// screen for managing categories, user can add edit or delete them
export default function CategoriesScreen() {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;
  const { categories, setCategories } = context;

  // deletes the category and refreshes the list from the database
  const deleteCategory = async (id: number) => {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Categories" subtitle={`${categories.length} categories`} />
      <PrimaryButton label="Add Category" onPress={() => router.push({ pathname: '../category/add' })} />
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {categories.length === 0 ? (
          <Text style={styles.empty}>No categories yet. Add one to get started.</Text>
        ) : (
          categories.map(cat => (
            <CategoryCard key={cat.id} category={cat} onDelete={deleteCategory} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  listContent: { paddingBottom: 24, paddingTop: 14 },
  empty: { color: '#94A3B8', fontSize: 14, marginTop: 48, textAlign: 'center' },
});
