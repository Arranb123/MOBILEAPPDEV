import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

type Props = {
  category: Category;
  onDelete: (id: number) => void;
};

export default function CategoryCard({ category, onDelete }: Props) {
  const router = useRouter();
  const t = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: category.color }]} />
        <Text style={styles.icon}>{category.icon}</Text>
        <Text style={[styles.name, { color: t.text }]}>{category.name}</Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton
          compact
          label="Edit"
          variant="secondary"
          onPress={() =>
            router.push({ pathname: '/category/[id]/edit', params: { id: category.id.toString() } })
          }
        />
        <PrimaryButton
          compact
          label="Delete"
          variant="danger"
          onPress={() => onDelete(category.id)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    borderRadius: 999,
    height: 14,
    marginRight: 8,
    width: 14,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
});
