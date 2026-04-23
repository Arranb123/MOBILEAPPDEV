import { AppContext, Application } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#2563EB', Interviewing: '#D97706', Offer: '#16A34A',
  Rejected: '#DC2626', Withdrawn: '#6B7280',
};

const STATUS_BG: Record<string, string> = {
  Applied: '#EFF6FF', Interviewing: '#FFFBEB', Offer: '#F0FDF4',
  Rejected: '#FEF2F2', Withdrawn: '#F9FAFB',
};

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();
  const context = useContext(AppContext);
  const category = context?.categories.find(c => c.id === application.categoryId);
  const accentColor = STATUS_COLORS[application.status] ?? '#EA580C';
  const statusBg = STATUS_BG[application.status] ?? '#F9FAFB';

  const openDetails = () =>
    router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } });

  return (
    <Pressable onPress={openDetails} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.company} numberOfLines={1}>{application.company}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: accentColor }]}>{application.status}</Text>
          </View>
        </View>
        <Text style={styles.role} numberOfLines={1}>{application.role}</Text>
        <View style={styles.metaRow}>
          {category ? (
            <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
          ) : null}
          {category ? <Text style={styles.metaText}>{category.name}</Text> : null}
          <Text style={styles.metaDate}>{application.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  accent: { width: 5 },
  content: { flex: 1, padding: 14 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  company: { color: '#0F172A', flex: 1, fontSize: 16, fontWeight: '700', marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  role: { color: '#64748B', fontSize: 13, fontWeight: '500', marginBottom: 10 },
  metaRow: { alignItems: 'center', flexDirection: 'row' },
  categoryDot: { borderRadius: 4, height: 8, marginRight: 5, width: 8 },
  metaText: { color: '#64748B', fontSize: 12, fontWeight: '500', marginRight: 10 },
  metaDate: { color: '#94A3B8', fontSize: 12, marginLeft: 'auto' },
});
