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

// simple bar chart built from views, didnt want to install a whole library just for this
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
  container: { marginTop: 10 },
  row: { alignItems: 'center', flexDirection: 'row', marginBottom: 12 },
  label: { color: '#475569', fontSize: 12, fontWeight: '600', width: 96 },
  track: { backgroundColor: '#F1F5F9', borderRadius: 6, flex: 1, height: 12, overflow: 'hidden' },
  bar: { borderRadius: 6, height: '100%', minWidth: 4 },
  count: { color: '#0F172A', fontSize: 12, fontWeight: '700', marginLeft: 10, width: 24 },
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

  // work out how many weeks in a row the user has hit their target
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
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    flex: 1,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  statNumber: { color: '#EA580C', fontSize: 30, fontWeight: '800' },
  statLabel: { color: '#64748B', fontSize: 12, fontWeight: '600', marginTop: 3 },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  sectionTitle: { color: '#0F172A', fontSize: 15, fontWeight: '800', letterSpacing: -0.2, marginBottom: 6 },
  streakRow: { alignItems: 'center', flexDirection: 'row', marginTop: 8 },
  streakNumber: { color: '#EA580C', fontSize: 44, fontWeight: '800', marginRight: 14 },
  streakLabel: { color: '#64748B', flex: 1, fontSize: 14, fontWeight: '500' },
  streakHint: { color: '#94A3B8', fontSize: 13, marginTop: 8 },
  empty: { color: '#94A3B8', fontSize: 14, marginTop: 48, textAlign: 'center' },
});
