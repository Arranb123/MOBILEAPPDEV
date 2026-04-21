import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, statusLogs } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function AddApplication() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  if (!context) return null;
  const { setApplications, categories } = context;

  const saveApplication = async () => {
    if (!company.trim() || !role.trim()) { setError('Company and role are required.'); return; }
    if (!selectedCategoryId) { setError('Please select a category.'); return; }
    setError('');
    await db.insert(applicationsTable).values({ company, role, date, status: 'Applied', categoryId: selectedCategoryId, notes: notes || null });
    const rows = await db.select().from(applicationsTable);
    const newApp = rows[rows.length - 1];
    await db.insert(statusLogs).values({ applicationId: newApp.id, status: 'Applied', date, notes: null });
    setApplications(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Add Application" subtitle="Track a new job application." />
        <View style={styles.form}>
          <FormField label="Company" value={company} onChangeText={setCompany} />
          <FormField label="Role" value={role} onChangeText={setRole} />
          <FormField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" />
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map(cat => (
              <Pressable key={cat.id} onPress={() => setSelectedCategoryId(cat.id)}
                style={[styles.chip, { borderColor: cat.color }, selectedCategoryId === cat.id && { backgroundColor: cat.color }]}>
                <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Save Application" onPress={saveApplication} />
        <View style={styles.cancelButton}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFF7ED', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  cancelButton: { marginTop: 10 },
  categoryLabel: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { color: '#374151', fontSize: 13, fontWeight: '500' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  error: { color: '#B91C1C', fontSize: 13, marginBottom: 12 },
});
