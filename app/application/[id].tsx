import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, statusLogs as statusLogsTable } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

type StatusLog = {
  id: number;
  applicationId: number;
  status: string;
  date: string;
  notes: string | null;
};

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
  const [logs, setLogs] = useState<StatusLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const rows = await db
        .select()
        .from(statusLogsTable)
        .where(eq(statusLogsTable.applicationId, Number(id)));
      setLogs(rows.sort((a, b) => b.date.localeCompare(a.date)));
    };
    void loadLogs();
  }, [id]);

  if (!context) return null;
  const { applications, setApplications, categories } = context;

  const application = applications.find((a: Application) => a.id === Number(id));
  if (!application) return null;

  const category = categories.find(c => c.id === application.categoryId);

  const deleteApplication = async () => {
    await db.delete(statusLogsTable).where(eq(statusLogsTable.applicationId, Number(id)));
    await db.delete(applicationsTable).where(eq(applicationsTable.id, Number(id)));
    const rows = await db.select().from(applicationsTable);
    setApplications(rows);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title={application.company} subtitle={application.role} />

        <View style={styles.tags}>
          <InfoTag label="Status" value={application.status} />
          <InfoTag label="Date" value={application.date} />
          {category ? <InfoTag label="Category" value={category.name} /> : null}
        </View>

        {application.notes ? (
          <Text style={[styles.notes, { backgroundColor: t.card, borderColor: t.border, color: t.text }]}>
            {application.notes}
          </Text>
        ) : null}

        <PrimaryButton label="Edit" onPress={() => router.push({ pathname: '/application/[id]/edit', params: { id } })} />
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Update Status" variant="secondary" onPress={() => router.push({ pathname: '/application/[id]/status', params: { id } })} />
        </View>
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Delete" variant="danger" onPress={deleteApplication} />
        </View>
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Back" variant="secondary" onPress={() => router.back()} />
        </View>

        {logs.length > 0 ? (
          <View style={styles.logsSection}>
            <Text style={[styles.logsTitle, { color: t.text }]}>Status History</Text>
            {logs.map(log => (
              <View key={log.id} style={[styles.logItem, { backgroundColor: t.card, borderColor: t.border }]}>
                <Text style={[styles.logStatus, { color: t.text }]}>{log.status}</Text>
                <Text style={[styles.logDate, { color: t.textMuted }]}>{log.date}</Text>
                {log.notes ? <Text style={[styles.logNotes, { color: t.text }]}>{log.notes}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  notes: { borderRadius: 10, borderWidth: 1, fontSize: 14, marginBottom: 18, padding: 12 },
  buttonSpacing: { marginTop: 10 },
  logsSection: { marginTop: 28 },
  logsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  logItem: { borderRadius: 10, borderWidth: 1, marginBottom: 8, padding: 12 },
  logStatus: { fontSize: 14, fontWeight: '600' },
  logDate: { fontSize: 12, marginTop: 2 },
  logNotes: { fontSize: 13, marginTop: 4 },
});
