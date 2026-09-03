import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { useColors } from '@/src/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: CustomButtonProps) {
  const colors = useColors();
  const buttonStyles = getStyles(colors);
  const isButtonDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[buttonStyles.button, style, isButtonDisabled && buttonStyles.buttonDisabled]}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={buttonStyles.content}>
          {icon ? (
            typeof icon === 'string'
              ? <Text style={buttonStyles.icon}>{icon}</Text>
              : icon
          ) : null}
          <Text style={[buttonStyles.buttonText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minHeight: 52,
  },
  buttonDisabled: { opacity: 0.6 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 22 },
  buttonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: Platform.OS === 'ios' ? 16 : 22 },
});