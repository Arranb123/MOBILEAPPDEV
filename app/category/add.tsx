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
  safeArea: { backgroundColor: '#FFF7ED', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  colorLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  colorDot: { borderRadius: 999, height: 32, width: 32 },
  colorDotSelected: { borderColor: '#111827', borderWidth: 3 },
});
