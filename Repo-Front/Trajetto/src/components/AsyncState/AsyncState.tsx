import React from 'react';
import { ActivityIndicator, StyleProp, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type AsyncStateProps = {
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  loadingText?: string;
  spinnerColor?: string;
  error?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  empty?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: React.ReactNode;
};

/**
 * Unifica loading/erro/vazio com mensagem orientativa e acao de recuperacao (retry),
 * pra nao duplicar essa logica em cada tela que busca dado assincrono.
 */
export default function AsyncState({
  style,
  loading,
  loadingText,
  spinnerColor,
  error,
  onRetry,
  retryLabel = 'Tentar novamente',
  empty,
  emptyIcon = '📭',
  emptyTitle = 'Nada por aqui',
  emptyDescription,
  children,
}: AsyncStateProps) {
  const colors = useColors();
  const s = styles(colors);

  if (loading) {
    return (
      <View style={[s.wrapper, style]}>
        <ActivityIndicator size="large" color={spinnerColor ?? colors.primary} />
        {loadingText ? <Text style={s.loadingText}>{loadingText}</Text> : null}
      </View>
    );
  }

  if (error) {
    return (
      <View style={[s.wrapper, style]}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorText}>{error}</Text>
        {onRetry ? (
          <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.85}>
            <Text style={s.retryText}>{retryLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (empty) {
    return (
      <View style={[s.wrapper, style]}>
        <Text style={s.emptyIcon}>{emptyIcon}</Text>
        <Text style={s.emptyTitle}>{emptyTitle}</Text>
        {emptyDescription ? <Text style={s.emptyDescription}>{emptyDescription}</Text> : null}
      </View>
    );
  }

  return <>{children}</>;
}
