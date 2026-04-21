import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, categories as categoriesTable, sessions as sessionsTable, settings as settingsTable, statusLogs as statusLogsTable, targets as targetsTable, users as usersTable } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
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
  const t = useTheme();

  if (!context) return null;
  const {
    currentUser, setCurrentUser, setApplications, setCategories,
    applications, categories,
    theme, setTheme,
    notificationsEnabled, setNotificationsEnabled,
  } = context;

  if (!currentUser) return null;

  const toggleTheme = async (value: boolean) => {
    const next = value ? 'dark' : 'light';
    setTheme(next);
    await db.insert(settingsTable).values({ key: 'theme', value: next })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: next } });
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await db.insert(settingsTable).values({ key: 'notifications_enabled', value: value ? 'true' : 'false' })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: value ? 'true' : 'false' } });
  };

  const exportCSV = async () => {
    const headers = 'Company,Role,Date,Status,Category,Notes';
    const rows = applications.map(a => {
      const cat = categories.find(c => c.id === a.categoryId);
      const notes = (a.notes ?? '').replace(/"/g, '""');
      return `"${a.company}","${a.role}","${a.date}","${a.status}","${cat?.name ?? ''}","${notes}"`;
    });
    const csv = [headers, ...rows].join('\n');
    const path = (FileSystem.documentDirectory ?? '') + 'applications.csv';
    await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, { mimeType: 'text/csv', UTI: 'public.comma-separated-values-text' });
    } else {
      Alert.alert('Exported', `CSV saved to: ${path}`);
    }
  };

  const logout = async () => {
    await db.delete(sessionsTable);
    setCurrentUser(null);
    router.replace('/login');
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScreenHeader title="Profile" subtitle="Your account details." />

      <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: t.textMuted }]}>Name</Text>
          <Text style={[styles.infoValue, { color: t.text }]}>{currentUser.name}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: t.divider }]} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: t.textMuted }]}>Email</Text>
          <Text style={[styles.infoValue, { color: t.text }]}>{currentUser.email}</Text>
        </View>
      </View>

      <View style={[styles.settingsCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: t.text }]}>Dark Mode</Text>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.divider, { backgroundColor: t.divider }]} />
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: t.text }]}>Daily Reminders</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#CBD5E1', true: '#0F766E' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <PrimaryButton label="Export Applications (CSV)" onPress={exportCSV} />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Logout" variant="secondary" onPress={logout} />
      </View>
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Delete Profile" variant="danger" onPress={deleteProfile} />
      </View>
      <Text style={[styles.warning, { color: t.textMuted }]}>Deleting your profile removes all data permanently.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  infoCard: { borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { height: 1, marginVertical: 4 },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  settingsCard: { borderRadius: 14, borderWidth: 1, marginBottom: 24, padding: 16 },
  settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  settingLabel: { fontSize: 15 },
  buttonSpacing: { marginTop: 10 },
  warning: { fontSize: 12, marginTop: 16, textAlign: 'center' },
});
