import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, categories as categoriesTable, sessions as sessionsTable, settings as settingsTable, statusLogs as statusLogsTable, targets as targetsTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
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
    await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' });
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

  const bg = darkMode ? '#0F172A' : '#F1F5F9';
  const cardBg = darkMode ? '#1E293B' : '#FFFFFF';
  const textPrimary = darkMode ? '#F1F5F9' : '#0F172A';
  const textSecondary = darkMode ? '#94A3B8' : '#64748B';
  const borderColor = darkMode ? '#334155' : '#F1F5F9';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <ScreenHeader title="Profile" subtitle="Your account details." />

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentUser.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.userName, { color: textPrimary }]}>{currentUser.name}</Text>
        <Text style={[styles.userEmail, { color: textSecondary }]}>{currentUser.email}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textSecondary }]}>Full Name</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{currentUser.name}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textSecondary }]}>Email</Text>
          <Text style={[styles.infoValue, { color: textPrimary }]}>{currentUser.email}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: borderColor }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: textSecondary }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#CBD5E1', true: '#EA580C' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <PrimaryButton label="Export to CSV" onPress={exportCSV} />
        <View style={styles.buttonGap}>
          <PrimaryButton label="Logout" variant="secondary" onPress={logout} />
        </View>
        <View style={styles.buttonGap}>
          <PrimaryButton label="Delete Profile" variant="danger" onPress={deleteProfile} />
        </View>
      </View>
      <Text style={[styles.warning, { color: textSecondary }]}>Deleting your profile removes all data permanently.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  avatarSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 40,
    height: 72,
    justifyContent: 'center',
    marginBottom: 12,
    width: 72,
  },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  userEmail: { fontSize: 14 },
  card: {
    borderRadius: 14,
    elevation: 2,
    marginBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  infoRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  divider: { height: 1 },
  infoLabel: { fontSize: 14, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700' },
  buttonGroup: {},
  buttonGap: { marginTop: 10 },
  warning: { fontSize: 12, marginTop: 16, textAlign: 'center' },
});
