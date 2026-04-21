import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
};

export default function FormField({ label, value, onChangeText, placeholder, secureTextEntry }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder ?? label}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, color: '#111827', fontSize: 15, paddingHorizontal: 12, paddingVertical: 10 },
});
