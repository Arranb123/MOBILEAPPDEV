import ApplicationCard from '@/components/ApplicationCard';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useTheme } from '@/hooks/use-theme';
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

  const t = useTheme();
  if (!context) return null;
  const { applications, categories } = context;

  const filtered = applications.filter(app => {
    if (
      searchText &&
      !app.company.toLowerCase().includes(searchText.toLowerCase()) &&
      !app.role.toLowerCase().includes(searchText.toLowerCase())
    ) return false;
    if (filterCategoryId && app.categoryId !== filterCategoryId) return false;
    if (fromDate && app.date < fromDate) return false;
    if (toDate && app.date > toDate) return false;
    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.background }]}>
      <ScreenHeader
        title="Applications"
        subtitle={`${filtered.length} of ${applications.length} shown`}
      />

      <PrimaryButton
        label="Add Application"
        onPress={() => router.push({ pathname: '../add' })}
      />

      <TextInput
        placeholder="Search company or role..."
        placeholderTextColor={t.textMuted}
        value={searchText}
        onChangeText={setSearchText}
        style={[styles.searchInput, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
      />

      <View style={styles.chipRow}>
        <Pressable
          onPress={() => setFilterCategoryId(null)}
          style={[styles.chip, !filterCategoryId && styles.chipActive]}
        >
          <Text style={[styles.chipText, { color: t.chipText }, !filterCategoryId && styles.chipTextActive]}>All</Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            onPress={() => setFilterCategoryId(filterCategoryId === cat.id ? null : cat.id)}
            style={[styles.chip, { borderColor: cat.color }, filterCategoryId === cat.id && { backgroundColor: cat.color }]}
          >
            <Text style={[styles.chipText, { color: t.chipText }, filterCategoryId === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={[styles.dateLabel, { color: t.textMuted }]}>From</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={t.textMuted}
            value={fromDate}
            onChangeText={setFromDate}
            style={[styles.dateInput, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
          />
        </View>
        <View style={styles.dateField}>
          <Text style={[styles.dateLabel, { color: t.textMuted }]}>To</Text>
          <TextInput
            placeholder="YYYY-MM-DD"
            placeholderTextColor={t.textMuted}
            value={toDate}
            onChangeText={setToDate}
            style={[styles.dateInput, { backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.text }]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No applications match your filters.</Text>
        ) : (
          filtered.map(app => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    borderColor: '#CBD5E1',
    borderRadius: 999,
    borderWidth: 1.5,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  chipText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  empty: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 32,
    textAlign: 'center',
  },
});
