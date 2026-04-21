import { AppContext, Application } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();
  const context = useContext(AppContext);
  const t = useTheme();
  const category = context?.categories.find(c => c.id === application.categoryId);

  const openDetails = () =>
    router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } });

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <Pressable onPress={openDetails}>
        <Text style={[styles.company, { color: t.text }]}>{application.company}</Text>
        <Text style={[styles.role, { color: t.textMuted }]}>{application.role}</Text>
      </Pressable>

      <View style={styles.tags}>
        <InfoTag label="Status" value={application.status} />
        {category ? <InfoTag label="Category" value={category.name} /> : null}
        <InfoTag label="Date" value={application.date} />
      </View>

      <PrimaryButton compact label="View Details" onPress={openDetails} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  company: {
    fontSize: 18,
    fontWeight: '700',
  },
  role: {
    fontSize: 14,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
});
