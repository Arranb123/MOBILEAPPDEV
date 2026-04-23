import ApplicationCard from '@/components/ApplicationCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../_layout';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [searchText, setSearchText] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  if (!context) return null;
  const { applications, categories } = context;

  const filtered = applications.filter(app => {
    if (searchText && !app.company.toLowerCase().includes(searchText.toLowerCase()) && !app.role.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (filterCategoryId && app.categoryId !== filterCategoryId) return false;
    if (fromDate && app.date < fromDate) return false;
    if (toDate && app.date > toDate) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Applications" subtitle={`${filtered.length} of ${applications.length} shown`} />
      <PrimaryButton label="+ Add Application" onPress={() => router.push({ pathname: '../add' })} />
      <TextInput
        placeholder="Search company or role..."
        placeholderTextColor="#94A3B8"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
        <Pressable onPress={() => setFilterCategoryId(null)} style={[styles.chip, !filterCategoryId && styles.chipActive]}>
          <Text style={[styles.chipText, !filterCategoryId && styles.chipTextActive]}>All</Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
            style={[styles.chip, { borderColor: cat.color }, filterCategoryId === cat.id && { backgroundColor: cat.color }]}
          >
            <Text style={[styles.chipText, filterCategoryId === cat.id && styles.chipTextActive]}>{cat.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>FROM</Text>
          <TextInput placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" value={fromDate} onChangeText={setFromDate} style={styles.dateInput} />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>TO</Text>
          <TextInput placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" value={toDate} onChangeText={setToDate} style={styles.dateInput} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No applications match your filters.</Text>
        ) : (
          filtered.map(app => <ApplicationCard key={app.id} application={app} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F1F5F9', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 10,
    borderWidth: 1.5,
    color: '#111827',
    fontSize: 14,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  chipScroll: { marginTop: 12 },
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  chip: { borderColor: '#CBD5E1', borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 7 },
  chipActive: { backgroundColor: '#EA580C', borderColor: '#EA580C' },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  dateRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  dateField: { flex: 1 },
  dateLabel: { color: '#64748B', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5 },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1.5,
    color: '#111827',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  listContent: { paddingBottom: 24, paddingTop: 14 },
  empty: { color: '#94A3B8', fontSize: 14, marginTop: 48, textAlign: 'center' },
});
