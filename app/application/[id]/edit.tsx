import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../../_layout';

export default function EditApplication() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const application = context?.applications.find((a: Application) => a.id === Number(id));

  useEffect(() => {
    if (!application) return;
    setCompany(application.company);
    setRole(application.role);
    setDate(application.date);
    setNotes(application.notes ?? '');
    setSelectedCategoryId(application.categoryId);
  }, [application]);

  if (!context || !application) return null;
  const { setApplications, categories } = context;

  const saveChanges = async () => {
    if (!company.trim() || !role.trim()) { setError('Company and role are required.'); return; }
    if (!selectedCategoryId) { setError('Please select a category.'); return; }
    setError('');
    await db.update(applicationsTable).set({ company, role, date, notes: notes || null, categoryId: selectedCategoryId }).where(eq(applicationsTable.id, Number(id)));
    const rows = await db.select().from(applicationsTable);
    setApplications(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Edit Application" subtitle={`Update ${application.company}`} />
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
        <PrimaryButton label="Save Changes" onPress={saveChanges} />
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
  categoryLabel: { color: '#374151', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8 },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  error: { color: '#DC2626', fontSize: 13, fontWeight: '500', marginBottom: 12 },
});
