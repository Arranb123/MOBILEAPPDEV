import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
};

export default function InfoTag({ label, value }: Props) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label}>{label}: </Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 6,
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
  },
});