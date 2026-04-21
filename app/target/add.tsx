import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function AddTarget() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [count, setCount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!context) return null;
  const { categories } = context;

  const saveTarget = async () => {
    const parsed = parseInt(count, 10);
    if (!parsed || parsed < 1) return;
    await db.insert(targetsTable).values({ period, count: parsed, categoryId: selectedCategoryId });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Target" subtitle="Set a new application goal." />

        <Text style={[styles.label, { color: t.label }]}>Period</Text>
        <View style={styles.periodRow}>
          {(['weekly', 'monthly'] as const).map(p => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.chip, { borderColor: t.chipBorder }, period === p && styles.chipActive]}
            >
              <Text style={[styles.chipText, { color: t.chipText }, period === p && styles.chipTextActive]}>
                {p === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          <FormField
            label="Goal (number of applications)"
            value={count}
            onChangeText={setCount}
            placeholder="e.g. 5"
          />
        </View>

        <Text style={[styles.label, { color: t.label }]}>Category (optional)</Text>
        <View style={styles.categoryRow}>
          <Pressable
            onPress={() => setSelectedCategoryId(null)}
            style={[styles.chip, { borderColor: t.chipBorder }, !selectedCategoryId && styles.chipActive]}
          >
            <Text style={[styles.chipText, { color: t.chipText }, !selectedCategoryId && styles.chipTextActive]}>
              All Categories
            </Text>
          </Pressable>
          {categories.map(cat => (
            <Pressable
              key={cat.id}
              onPress={() => setSelectedCategoryId(cat.id)}
              style={[
                styles.chip,
                { borderColor: cat.color },
                selectedCategoryId === cat.id && { backgroundColor: cat.color },
              ]}
            >
              <Text style={[
                styles.chipText,
                { color: t.chipText },
                selectedCategoryId === cat.id && styles.chipTextActive,
              ]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton label="Save Target" onPress={saveTarget} />
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
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { borderRadius: 999, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7 },
  chipActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  chipText: { fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
});
