import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { useFocusEffect } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

const STATUS_COLORS: Record<string, string> = {
  Applied: '#1D4ED8', Interviewing: '#D97706', Offer: '#15803D',
  Rejected: '#B91C1C', Withdrawn: '#6B7280',
};
const STATUS_OPTIONS = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function getWeekRange(weeksAgo: number): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) - weeksAgo * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

function BarChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <View style={chartStyles.container}>
      {data.map(item => (
        <View key={item.label} style={chartStyles.row}>
          <Text style={chartStyles.label}>{item.label}</Text>
          <View style={chartStyles.track}>
            <View style={[chartStyles.bar, { width: `${(item.count / max) * 100}%`, backgroundColor: item.color }]} />
          </View>
          <Text style={chartStyles.count}>{item.count}</Text>
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { marginTop: 8 },
  row: { alignItems: 'center', flexDirection: 'row', marginBottom: 10 },
  label: { color: '#374151', fontSize: 12, width: 90 },
  track: { backgroundColor: '#F3F4F6', flex: 1, height: 14, overflow: 'hidden' },
  bar: { height: '100%', minWidth: 4 },
  count: { color: '#374151', fontSize: 12, fontWeight: '600', marginLeft: 8, width: 24 },
});

export default function InsightsScreen() {
  const context = useContext(AppContext);
  const [weeklyTarget, setWeeklyTarget] = useState(0);

  useFocusEffect(useCallback(() => {
    void db.select().from(targetsTable).then(rows => {
      const wt = rows.find(r => r.period === 'weekly' && !r.categoryId);
      setWeeklyTarget(wt?.count ?? 0);
    });
  }, []));

  if (!context) return null;
  const { applications, categories } = context;

  if (applications.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Insights" subtitle="Your application overview." />
        <Text style={styles.empty}>No applications yet. Add some to see insights.</Text>
      </SafeAreaView>
    );
  }

  const weekStart = getWeekStart();
  const monthStart = getMonthStart();
  const thisWeek = applications.filter((a: Application) => a.date >= weekStart).length;
  const thisMonth = applications.filter((a: Application) => a.date >= monthStart).length;
  const total = applications.length;

  const statusData = STATUS_OPTIONS.map(s => ({
    label: s,
    count: applications.filter((a: Application) => a.status === s).length,
    color: STATUS_COLORS[s] ?? '#C2410C',
  }));

  const categoryData = categories.map(cat => ({
    label: cat.name,
    count: applications.filter((a: Application) => a.categoryId === cat.id).length,
    color: cat.color,
  }));

  let streak = 0;
  if (weeklyTarget > 0) {
    const curr = getWeekRange(0);
    const currCount = applications.filter((a: Application) => a.date >= curr.start && a.date <= curr.end).length;
    const startFrom = currCount >= weeklyTarget ? 0 : 1;
    for (let i = startFrom; i < 52; i++) {
      const { start, end } = getWeekRange(i);
      const count = applications.filter((a: Application) => a.date >= start && a.date <= end).length;
      if (count >= weeklyTarget) streak++;
      else break;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader title="Insights" subtitle="Your application overview." />

        <View style={styles.summaryRow}>
          {[{ label: 'Total', value: total }, { label: 'This Month', value: thisMonth }, { label: 'This Week', value: thisWeek }].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {weeklyTarget > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Streak</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>
                {streak === 1 ? 'consecutive week' : 'consecutive weeks'} meeting your target
              </Text>
            </View>
            {streak === 0 && (
              <Text style={styles.streakHint}>
                Meet your weekly target of {weeklyTarget} applications to start a streak.
              </Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Status</Text>
          <BarChart data={statusData} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By Category</Text>
          <BarChart data={categoryData} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFF7ED', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, flex: 1, paddingVertical: 16 },
  statNumber: { color: '#111827', fontSize: 28, fontWeight: '700' },
  statLabel: { color: '#6B7280', fontSize: 12, marginTop: 2 },
  section: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, marginBottom: 16, padding: 16 },
  sectionTitle: { color: '#111827', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  streakRow: { alignItems: 'center', flexDirection: 'row', marginTop: 8 },
  streakNumber: { color: '#C2410C', fontSize: 40, fontWeight: '800', marginRight: 12 },
  streakLabel: { color: '#6B7280', flex: 1, fontSize: 14 },
  streakHint: { color: '#9CA3AF', fontSize: 13, marginTop: 8 },
  empty: { color: '#9CA3AF', fontSize: 14, marginTop: 32, textAlign: 'center' },
});
