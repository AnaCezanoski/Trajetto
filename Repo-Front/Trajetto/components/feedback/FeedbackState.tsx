// A aparência única dos avisos do app. Todo aviso tem a mesma anatomia: símbolo, título
// curto, mensagem que orienta e, quando faz sentido, um botão que oferece uma saída.

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY = '#023665';

export type FeedbackVariant = 'loading' | 'error' | 'empty';

/** O texto de um aviso. Toda tela pode trocar essas palavras pelas do caso dela. */
export interface FeedbackCopy {
  icon?: string;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface FeedbackStateProps extends FeedbackCopy {
  variant: FeedbackVariant;
}

// Palavras padrão: a tela só escreve o que for específico dela.
const PADRAO: Record<FeedbackVariant, Required<Pick<FeedbackCopy, 'icon' | 'title' | 'message'>> & { actionLabel: string }> = {
  loading: {
    icon: '',
    title: 'Carregando...',
    message: 'Só um instante enquanto buscamos as informações.',
    actionLabel: '',
  },
  error: {
    icon: '⚠️',
    title: 'Algo deu errado',
    message: 'Não foi possível carregar as informações. Verifique sua conexão e tente novamente.',
    actionLabel: 'Tentar novamente',
  },
  empty: {
    icon: '📭',
    title: 'Nada por aqui ainda',
    message: 'Não encontramos nada para mostrar neste momento.',
    actionLabel: 'Atualizar',
  },
};

export function FeedbackState({
  variant, icon, title, message, actionLabel, onAction,
}: FeedbackStateProps) {
  const padrao = PADRAO[variant];
  const textoDaAcao = actionLabel ?? padrao.actionLabel;
  // Sem ação para onde ir, o botão seria enfeite.
  const mostrarAcao = Boolean(onAction && textoDaAcao);

  return (
    <View style={styles.container} accessibilityRole="summary">
      {variant === 'loading'
        ? <ActivityIndicator size="large" color={PRIMARY} />
        : <Text style={styles.icon}>{icon ?? padrao.icon}</Text>}

      <Text style={styles.title}>{title ?? padrao.title}</Text>
      <Text style={styles.message}>{message ?? padrao.message}</Text>

      {mostrarAcao && (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.actionText}>{textoDaAcao}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    backgroundColor: '#f4f6f9',
  },
  icon: { fontSize: 44, marginBottom: 4 },
  title: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
    textAlign: 'center',
  },
  action: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  actionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default FeedbackState;
