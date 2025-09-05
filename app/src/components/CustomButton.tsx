import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function CustomButton({ 
  title, 
  onPress, 
  disabled = false, 
  style, 
  textStyle 
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#8B7EC8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});
