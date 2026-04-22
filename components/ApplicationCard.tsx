import { AppContext, Application } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#1D4ED8', Interviewing: '#D97706', Offer: '#15803D',
  Rejected: '#B91C1C', Withdrawn: '#6B7280',
};

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();
  const context = useContext(AppContext);
  const category = context?.categories.find(c => c.id === application.categoryId);
  const accentColor = STATUS_COLORS[application.status] ?? '#C2410C';

  const openDetails = () =>
    router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } });

  return (
    <Pressable onPress={openDetails} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <Text style={styles.company}>{application.company}</Text>
        <Text style={styles.role}>{application.role}</Text>
        <View style={styles.tags}>
          <InfoTag label="Status" value={application.status} />
          {category ? <InfoTag label="Category" value={category.name} /> : null}
          <InfoTag label="Date" value={application.date} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, flexDirection: 'row', marginBottom: 12, overflow: 'hidden' },
  pressed: { opacity: 0.85 },
  accent: { width: 5 },
  content: { flex: 1, padding: 14 },
  company: { color: '#111827', fontSize: 17, fontWeight: '700' },
  role: { color: '#6B7280', fontSize: 13, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
});
