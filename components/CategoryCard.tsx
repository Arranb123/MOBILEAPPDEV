import PrimaryButton from '@/components/ui/primary-button';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

type Category = { id: number; name: string; color: string; icon: string };
type Props = { category: Category; onDelete: (id: number) => void };

export default function CategoryCard({ category, onDelete }: Props) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.colorBar, { backgroundColor: category.color }]} />
        <Text style={styles.name}>{category.name}</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton compact label="Edit" variant="secondary"
          onPress={() => router.push({ pathname: '/category/[id]/edit', params: { id: category.id.toString() } })} />
        <PrimaryButton compact label="Delete" variant="danger" onPress={() => onDelete(category.id)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  row: { alignItems: 'center', flexDirection: 'row' },
  colorBar: { borderRadius: 4, height: 36, marginRight: 14, width: 5 },
  name: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
});
