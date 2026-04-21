import { AppContext, Application } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  application: Application;
};

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();
  const context = useContext(AppContext);
  const category = context?.categories.find(c => c.id === application.categoryId);

  const openDetails = () =>
    router.push({ pathname: '/application/[id]', params: { id: application.id.toString() } });

  return (
    <View style={styles.card}>
      <Pressable onPress={openDetails}>
        <Text style={styles.company}>{application.company}</Text>
        <Text style={styles.role}>{application.role}</Text>
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
  card: { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderWidth: 1, marginBottom: 12, padding: 14 },
  company: { color: '#111827', fontSize: 18, fontWeight: '700' },
  role: { color: '#6B7280', fontSize: 14, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
});
