import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

const COLOR_OPTIONS = [
  '#0F766E', '#1D4ED8', '#9333EA', '#B91C1C',
  '#D97706', '#15803D', '#0369A1', '#BE185D',
];

const ICON_OPTIONS = ['💼', '💻', '💰', '📢', '🎨', '🏢', '🎓', '🔬', '📦', '🌍', '⚕️', '🔧'];

export default function AddCategory() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);

  if (!context) return null;
  const { setCategories } = context;

  const saveCategory = async () => {
    if (!name.trim()) return;
    await db.insert(categoriesTable).values({ name, color: selectedColor, icon: selectedIcon });
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Category" subtitle="Create a new category." />
        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} />

          <Text style={[styles.colorLabel, { color: t.label }]}>Icon</Text>
          <View style={styles.colorRow}>
            {ICON_OPTIONS.map(icon => (
              <Pressable
                key={icon}
                accessibilityLabel={`Select icon ${icon}`}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconOption,
                  { borderColor: t.border },
                  selectedIcon === icon && { borderColor: '#0F766E', backgroundColor: t.card },
                ]}
              >
                <Text style={styles.iconText}>{icon}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.colorLabel, { color: t.label }]}>Colour</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(color => (
              <Pressable
                key={color}
                accessibilityLabel={`Select colour ${color}`}
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
              />
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
  safeArea: { flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  colorLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  colorDot: { borderRadius: 999, height: 32, width: 32 },
  colorDotSelected: { borderColor: '#111827', borderWidth: 3 },
  iconOption: { borderRadius: 8, borderWidth: 2, padding: 4 },
  iconText: { fontSize: 22 },
});
