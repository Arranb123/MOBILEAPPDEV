import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { applications as applicationsTable, categories as categoriesTable, sessions as sessionsTable, statusLogs as statusLogsTable, targets as targetsTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(AppContext);

  if (!context) return null;
  const { currentUser, setCurrentUser, setApplications, setCategories } = context;
  if (!currentUser) return null;

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
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Profile" subtitle="Your account details." />
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{currentUser.name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{currentUser.email}</Text>
        </View>
      </View>
      <PrimaryButton label="Logout" variant="secondary" onPress={logout} />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Delete Profile" variant="danger" onPress={deleteProfile} />
      </View>
      <Text style={styles.warning}>Deleting your profile removes all data permanently.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFF7ED', flex: 1, padding: 20 },
  infoCard: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, marginBottom: 24, padding: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { backgroundColor: '#F3F4F6', height: 1, marginVertical: 4 },
  infoLabel: { color: '#6B7280', fontSize: 14 },
  infoValue: { color: '#111827', fontSize: 14, fontWeight: '600' },
  buttonSpacing: { marginTop: 10 },
  warning: { color: '#9CA3AF', fontSize: 12, marginTop: 16, textAlign: 'center' },
});
