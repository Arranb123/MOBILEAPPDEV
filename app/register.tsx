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

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!context) return null;
  const { setCurrentUser } = context;

  const register = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    if (existing.length > 0) {
      setError('An account with this email already exists.');
      return;
    }

    await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()));

    const user = rows[0];
    await db.delete(sessionsTable);
    await db.insert(sessionsTable).values({ userId: user.id });
    setCurrentUser(user);
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScreenHeader title="Create Account" subtitle="Register to get started." />
      <View style={styles.form}>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" />
        <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Register" onPress={register} />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Back to Login" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  buttonSpacing: { marginTop: 10 },
  error: { color: '#B91C1C', fontSize: 13, marginBottom: 12 },
});
