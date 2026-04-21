import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { sessions as sessionsTable, users as usersTable } from '@/db/schema';
import { useTheme } from '@/hooks/use-theme';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from './_layout';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScreenHeader title="Welcome Back" subtitle="Sign in to continue." />
      <View style={styles.form}>
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Login" onPress={login} />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Create Account" variant="secondary" onPress={() => router.push('/register')} />
      </View>
      <Text style={[styles.hint, { color: t.textMuted }]}>Demo: demo@example.com / password</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  error: { color: '#B91C1C', fontSize: 13, marginBottom: 12 },
  hint: { fontSize: 12, marginTop: 24, textAlign: 'center' },
});
