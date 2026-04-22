import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomColor: '#E5E7EB', borderBottomWidth: 1, marginBottom: 16, paddingBottom: 12 },
  title: { color: '#111827', fontSize: 28, fontWeight: '700' },
  subtitle: { color: '#6B7280', fontSize: 14, marginTop: 4 },
});
