import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function PrimaryButton({ label, onPress, compact = false, variant = 'primary' }: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'danger' ? styles.danger : null,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' ? styles.secondaryLabel : null, compact ? styles.compactLabel : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', backgroundColor: '#EA580C', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13 },
  secondary: { backgroundColor: '#FFFFFF', borderColor: '#D1D5DB', borderWidth: 1.5 },
  danger: { backgroundColor: '#DC2626' },
  compact: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  pressed: { opacity: 0.8 },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  secondaryLabel: { color: '#1E293B' },
  compactLabel: { fontSize: 13, fontWeight: '600' },
});
