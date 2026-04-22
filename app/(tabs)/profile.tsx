import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, categories as categoriesTable, sessions as sessionsTable, settings as settingsTable, statusLogs as statusLogsTable, targets as targetsTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useContext } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;
  const { currentUser, setCurrentUser, setApplications, setCategories, darkMode, setDarkMode } = context;
  if (!currentUser) return null;

  const toggleDarkMode = async (value: boolean) => {
    setDarkMode(value);
    await db.insert(settingsTable).values({ key: 'darkMode', value: String(value) })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: String(value) } });
  };

  const logout = async () => {
    await db.delete(sessionsTable);
    setCurrentUser(null);
    router.replace('/login');
  };

  const exportCSV = async () => {
    const { applications, categories } = context;
    const header = 'Company,Role,Status,Date,Category\n';
    const rows = applications.map(a => {
      const cat = categories.find(c => c.id === a.categoryId)?.name ?? '';
      const company = `"${(a.company ?? '').replace(/"/g, '""')}"`;
      const role = `"${(a.role ?? '').replace(/"/g, '""')}"`;
      return `${company},${role},${a.status},${a.date},${cat}`;
    }).join('\n');
    const csv = header + rows;
    const path = FileSystem.documentDirectory + 'applications.csv';
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Applications' });
    } else {
      Alert.alert('Saved', `CSV saved to: ${path}`);
    }
  };

  const deleteProfile = async () => {
    await db.delete(statusLogsTable);
    await db.delete(applicationsTable);
    await db.delete(targetsTable);
    await db.delete(categoriesTable);
    await db.delete(sessionsTable);
    await db.delete(usersTable).where(eq(usersTable.id, currentUser.id));
    setApplications([]);
    setCategories([]);
    setCurrentUser(null);
    router.replace('/login');
  };

  const bg = darkMode ? '#111827' : '#FFF7ED';
  const cardBg = darkMode ? '#1F2937' : '#FFFFFF';
  const textPrimary = darkMode ? '#F9FAFB' : '#111827';
  const textSecondary = darkMode ? '#9CA3AF' : '#6B7280';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScreenHeader title="Profile" subtitle="Your account details." />
      <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textSecondary }]}>Name</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{currentUser.name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textSecondary }]}>Email</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{currentUser.email}</Text>
        </View>
      </View>
      <View style={[styles.toggleRow, { backgroundColor: cardBg }]}>
        <Text style={[styles.toggleLabel, { color: textPrimary }]}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#D1D5DB', true: '#C2410C' }}
          thumbColor="#FFFFFF"
        />
      </View>
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Export to CSV" onPress={exportCSV} />
      </View>
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Logout" variant="secondary" onPress={logout} />
      </View>
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Delete Profile" variant="danger" onPress={deleteProfile} />
      </View>
      <Text style={[styles.warning, { color: textSecondary }]}>Deleting your profile removes all data permanently.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  infoCard: { borderColor: '#E5E7EB', borderWidth: 1, marginBottom: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { backgroundColor: '#F3F4F6', height: 1, marginVertical: 4 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  toggleRow: { alignItems: 'center', borderColor: '#E5E7EB', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, padding: 16 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  buttonSpacing: { marginTop: 10 },
  warning: { fontSize: 12, marginTop: 16, textAlign: 'center' },
});
