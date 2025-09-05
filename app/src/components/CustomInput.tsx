import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  textStyle,
}: CustomInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, textStyle]}>{label}</Text>
      <TextInput
        style={[styles.input, textStyle]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        placeholderTextColor="#9E9E9E"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D1B69',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E6E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D1B69',
    backgroundColor: '#FFFFFF',
  },
});
