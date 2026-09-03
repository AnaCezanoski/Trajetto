import React, { useState, useRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleProp,
  TextStyle,
  ViewStyle,
  Pressable,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '@/src/theme';

type InputType = 'text' | 'password' | 'email' | 'numeric' | 'phone-pad' | 'code';

interface CustomInputProps {
  label?: string;
  error?: string;
  type?: InputType;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCorrect?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>; // Style for the outer container
  inputWrapperStyle?: StyleProp<ViewStyle>; // Style for the row wrapper
  inputStyle?: StyleProp<TextStyle>; // Style for the TextInput itself
  onBlur?: () => void;
  onFocus?: () => void;
}

export default function CustomInput({
  label,
  error,
  type = 'text',
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  keyboardType,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  autoFocus,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  autoCorrect,
  leftIcon,
  rightElement,
  style,
  inputWrapperStyle,
  inputStyle,
  onBlur,
  onFocus,
}: CustomInputProps) {
  const colors = useColors();
  const inputStyles = getStyles(colors);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isPassword = type === 'password';
  const currentKeyboardType = keyboardType || (
    type === 'email' ? 'email-address' :
    type === 'numeric' ? 'numeric' :
    type === 'phone-pad' ? 'phone-pad' :
    'default'
  );

  if (type === 'code') {
    const cells = Array(6).fill(0);
    const codeArray = value.split('');

    return (
      <View style={[inputStyles.fieldContainer, style]}>
        {label && <Text style={inputStyles.label}>{label}</Text>}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={inputStyles.codeContainer}
        >
          {cells.map((_, i) => {
            const isFocused = value.length === i;
            return (
              <View
                key={i}
                pointerEvents="none"
                style={[
                  inputStyles.codeCell,
                  isFocused && inputStyles.codeCellFocused,
                  error ? inputStyles.inputError : null,
                ]}
              >
                <Text style={inputStyles.codeText}>{codeArray[i] || ''}</Text>
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            style={inputStyles.hiddenInput}
            value={value}
            onChangeText={(t) => onChangeText(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="numeric"
            autoFocus={autoFocus}
            maxLength={6}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            textContentType="oneTimeCode"
            caretHidden
          />
        </Pressable>
        {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={[inputStyles.fieldContainer, style]}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <View style={[inputStyles.inputWrapper, error ? inputStyles.inputError : null, inputWrapperStyle]}>
        {leftIcon}
        <TextInput
          style={[inputStyles.input, inputStyle, isPassword && inputStyles.passwordInput]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={currentKeyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          secureTextEntry={isPassword && !showPassword}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          autoCorrect={autoCorrect}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {rightElement}
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={inputStyles.eyeBtn} activeOpacity={0.7}>
            {showPassword ? (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={colors.placeholder} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={colors.placeholder} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            ) : (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.68M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke={colors.placeholder} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M1 1L23 23" stroke={colors.placeholder} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={inputStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const getStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: colors.label,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  passwordInput: {
    paddingRight: 10,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeBtn: {
    padding: 4,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  codeCell: {
    width: 44,
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeCellFocused: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.white,
    borderWidth: 2,
  },
  codeText: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.01,
  },
});