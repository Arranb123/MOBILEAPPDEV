import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function AddTarget() {
  const router = useRouter();
  const context = useContext(AppContext);
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Target" subtitle="Set a new application goal." />
        <Text style={styles.label}>Period</Text>
        <View style={styles.periodRow}>
          {(['weekly', 'monthly'] as const).map(p => (
            <Pressable key={p} onPress={() => setPeriod(p)} style={[styles.chip, { borderColor: '#CBD5E1' }, period === p && styles.chipActive]}>
              <Text style={[styles.chipText, period === p && styles.chipTextActive]}>{p === 'weekly' ? 'Weekly' : 'Monthly'}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.form}>
          <FormField label="Goal (number of applications)" value={count} onChangeText={setCount} placeholder="e.g. 5" />
        </View>
        <Text style={styles.label}>Category (optional)</Text>
        <View style={styles.categoryRow}>
          <Pressable onPress={() => setSelectedCategoryId(null)} style={[styles.chip, { borderColor: '#CBD5E1' }, !selectedCategoryId && styles.chipActive]}>
            <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>All Categories</Text>
          </Pressable>
          {categories.map(cat => (
            <Pressable key={cat.id} onPress={() => setSelectedCategoryId(cat.id)}
              style={[styles.chip, { borderColor: cat.color }, selectedCategoryId === cat.id && { backgroundColor: cat.color }]}>
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>{cat.name}</Text>
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
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  label: { color: '#374151', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8 },
  chipActive: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
});
