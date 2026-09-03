import React, { Ref } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import StarRating from '@/components/Rating';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type RatingFormProps = {
  commentInputRef: Ref<TextInput>;
  ratingValue: number;
  onChangeRatingValue: (v: number) => void;
  comment: string;
  onChangeComment: (v: string) => void;
  onSave: () => void;
};

export default function RatingForm({
  commentInputRef, ratingValue, onChangeRatingValue, comment, onChangeComment, onSave,
}: RatingFormProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.ratingDropdown}>
      <Text style={s.ratingTitle}>Avaliar lugar</Text>
      <StarRating value={ratingValue} size={22} onChange={onChangeRatingValue} />
      <TextInput
        ref={commentInputRef}
        value={comment}
        onChangeText={onChangeComment}
        placeholder="Escreva um comentário..."
        placeholderTextColor={colors.timelineDotPast}
        style={s.ratingInput}
        multiline
      />
      <TouchableOpacity style={s.ratingButton} onPress={onSave}>
        <Text style={s.ratingButtonText}>Salvar avaliação</Text>
      </TouchableOpacity>
    </View>
  );
}
