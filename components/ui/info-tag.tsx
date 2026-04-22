import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
};

export default function InfoTag({ label, value }: Props) {
  return (
    <View style={styles.tag}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: '#FEF3C7',
    flexDirection: 'row',
    marginBottom: 6,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  label: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    color: '#78350F',
    fontSize: 12,
    fontWeight: '500',
  },
});