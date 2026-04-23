import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, statusLogs as statusLogsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

type StatusLog = { id: number; applicationId: number; status: string; date: string; notes: string | null };

export default function ApplicationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [logs, setLogs] = useState<StatusLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const rows = await db.select().from(statusLogsTable).where(eq(statusLogsTable.applicationId, Number(id)));
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title={application.company} subtitle={application.role} />
        <View style={styles.tags}>
          <InfoTag label="Status" value={application.status} />
          <InfoTag label="Date" value={application.date} />
          {category ? <InfoTag label="Category" value={category.name} /> : null}
        </View>
        {application.notes ? <Text style={styles.notes}>{application.notes}</Text> : null}
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
            <Text style={styles.logsTitle}>Status History</Text>
            {logs.map(log => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logStatus}>{log.status}</Text>
                <Text style={styles.logDate}>{log.date}</Text>
                {log.notes ? <Text style={styles.logNotes}>{log.notes}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, padding: 20 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  notes: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1.5,
    color: '#374151',
    fontSize: 14,
    marginBottom: 18,
    padding: 14,
  },
  buttonSpacing: { marginTop: 10 },
  logsSection: { marginTop: 28 },
  logsTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', letterSpacing: -0.2, marginBottom: 12 },
  logItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 1,
    marginBottom: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  logStatus: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  logDate: { color: '#64748B', fontSize: 12, marginTop: 2 },
  logNotes: { color: '#475569', fontSize: 13, marginTop: 4 },
});
