import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { sessions as sessionsTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!context) return null;
  const { setCurrentUser } = context;

  const login = async () => {
    setError('');
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    if (rows.length === 0 || rows[0].password !== password) {
      setError('Invalid email or password.');
      return;
    }

    const user = rows[0];
    await db.delete(sessionsTable);
    await db.insert(sessionsTable).values({ userId: user.id });
    setCurrentUser(user);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.logoArea}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>JT</Text>
        </View>
        <Text style={styles.appName}>JobTracker</Text>
        <Text style={styles.tagline}>Track every application, land your dream role.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>Sign in to your account</Text>
        <View style={styles.form}>
          <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton label="Sign In" onPress={login} />
        <View style={styles.buttonSpacing}>
          <PrimaryButton label="Create Account" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      </View>
      <Text style={styles.hint}>Demo: demo@example.com / password</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 32 },
  logoIcon: {
    alignItems: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 14,
    width: 64,
  },
  logoText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  appName: { color: '#0F172A', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { color: '#64748B', fontSize: 14, marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 4,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardTitle: { color: '#0F172A', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { color: '#64748B', fontSize: 14, marginBottom: 24 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  error: { color: '#DC2626', fontSize: 13, fontWeight: '500', marginBottom: 12 },
  hint: { color: '#94A3B8', fontSize: 12, marginTop: 20, textAlign: 'center' },
});
