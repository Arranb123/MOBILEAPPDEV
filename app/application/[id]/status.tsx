import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, statusLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../../_layout';

const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

export default function UpdateStatus() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!context) return null;
  const { setApplications } = context;

  const saveStatus = async () => {
    if (!selectedStatus) return;
    await db.insert(statusLogs).values({ applicationId: Number(id), status: selectedStatus, date, notes: notes || null });
    await db.update(applicationsTable).set({ status: selectedStatus }).where(eq(applicationsTable.id, Number(id)));
    const rows = await db.select().from(applicationsTable);
    setApplications(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Update Status" subtitle="Log a new status change." />
        <Text style={styles.label}>New Status</Text>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map(s => (
            <Pressable key={s} onPress={() => setSelectedStatus(s)} style={[styles.chip, selectedStatus === s && styles.chipSelected]}>
              <Text style={[styles.chipText, selectedStatus === s && styles.chipTextSelected]}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.form}>
          <FormField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional notes" />
        </View>
        <PrimaryButton label="Save Status" onPress={saveStatus} />
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, padding: 20 },
  label: { color: '#374151', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { borderColor: '#CBD5E1', borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8 },
  chipSelected: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
});
