import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

const COLOR_OPTIONS = ['#C2410C', '#1D4ED8', '#9333EA', '#B91C1C', '#D97706', '#15803D', '#0369A1', '#BE185D'];

export default function AddCategory() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  if (!context) return null;
  const { setCategories } = context;

  const saveCategory = async () => {
    if (!name.trim()) return;
    await db.insert(categoriesTable).values({ name, color: selectedColor, icon: '' });
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Category" subtitle="Create a new category." />
        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} />
          <Text style={styles.colorLabel}>Colour</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(color => (
              <Pressable key={color} accessibilityLabel={`Select colour ${color}`} onPress={() => setSelectedColor(color)}
                style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]} />
            ))}
          </View>
        </View>
        <PrimaryButton label="Save Category" onPress={saveCategory} />
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  colorLabel: { color: '#374151', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  colorDot: { borderRadius: 999, height: 36, width: 36 },
  colorDotSelected: { borderColor: '#0F172A', borderWidth: 3, transform: [{ scale: 1.15 }] },
});
