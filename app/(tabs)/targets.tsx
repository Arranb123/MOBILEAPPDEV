import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { targets as targetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext, Application } from '../_layout';

type Target = { id: number; period: string; count: number; categoryId: number | null };

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

export default function TargetsScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [targets, setTargets] = useState<Target[]>([]);

  useFocusEffect(useCallback(() => {
    void db.select().from(targetsTable).then(setTargets);
  }, []));

  if (!context) return null;
  const { applications, categories } = context;
  const weekStart = getWeekStart();
  const monthStart = getMonthStart();

  const getProgress = (target: Target) => {
    const periodStart = target.period === 'weekly' ? weekStart : monthStart;
    return applications.filter((a: Application) =>
      a.date >= periodStart && (!target.categoryId || a.categoryId === target.categoryId)
    ).length;
  };

  const deleteTarget = async (id: number) => {
    await db.delete(targetsTable).where(eq(targetsTable.id, id));
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Targets" subtitle="Your application goals." />
      <PrimaryButton label="Add Target" onPress={() => router.push({ pathname: '../target/add' })} />
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {targets.length === 0 ? (
          <Text style={styles.empty}>No targets set. Add one to track your goals.</Text>
        ) : (
          targets.map(target => {
            const progress = getProgress(target);
            const goal = target.count;
            const remaining = Math.max(goal - progress, 0);
            const exceeded = progress > goal;
            const met = progress >= goal;
            const percent = Math.min(progress / goal, 1);
            const category = categories.find(c => c.id === target.categoryId);
            return (
              <View key={target.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.period}>{target.period === 'weekly' ? 'Weekly' : 'Monthly'} Goal</Text>
                    <Text style={styles.categoryLabel}>{category ? category.name : 'All Categories'}</Text>
                  </View>
                  <Text style={styles.counts}>{progress} / {goal}</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { width: `${percent * 100}%` },
                    exceeded ? styles.barExceeded : met ? styles.barMet : styles.barProgress]} />
                </View>
                <View style={styles.statusRow}>
                  {exceeded ? <Text style={styles.exceeded}>Target exceeded!</Text>
                    : met ? <Text style={styles.met}>Target met</Text>
                    : <Text style={styles.remaining}>{remaining} more to reach goal</Text>}
                  <PrimaryButton compact label="Delete" variant="danger" onPress={() => deleteTarget(target.id)} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  listContent: { paddingBottom: 24, paddingTop: 14 },
  empty: { color: '#94A3B8', fontSize: 14, marginTop: 48, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  period: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  categoryLabel: { color: '#64748B', fontSize: 13, fontWeight: '500', marginTop: 2 },
  counts: { color: '#EA580C', fontSize: 22, fontWeight: '800' },
  barTrack: { backgroundColor: '#F1F5F9', borderRadius: 6, height: 10, marginBottom: 12, overflow: 'hidden' },
  bar: { borderRadius: 6, height: '100%' },
  barProgress: { backgroundColor: '#EA580C' },
  barMet: { backgroundColor: '#16A34A' },
  barExceeded: { backgroundColor: '#D97706' },
  statusRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  remaining: { color: '#64748B', fontSize: 13 },
  met: { color: '#16A34A', fontSize: 13, fontWeight: '700' },
  exceeded: { color: '#D97706', fontSize: 13, fontWeight: '700' },
});
