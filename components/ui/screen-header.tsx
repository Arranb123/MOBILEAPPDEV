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
  container: { marginBottom: 20, paddingBottom: 16 },
  title: { color: '#0F172A', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: '#64748B', fontSize: 14, fontWeight: '500', marginTop: 3 },
});
