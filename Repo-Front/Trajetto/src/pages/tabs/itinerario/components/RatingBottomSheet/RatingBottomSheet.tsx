import React, { useMemo } from 'react';
import { Keyboard, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import StarRating from '@/components/Rating';
import { useColors } from '@/src/theme';
import { usePlaceRating } from '../../hooks/usePlaceRating';
import RatingForm from './RatingForm/RatingForm';
import ReviewItem from './ReviewItem/ReviewItem';
import { styles } from './styles';

type RatingBottomSheetProps = ReturnType<typeof usePlaceRating>;

export default function RatingBottomSheet({
  user,
  bottomSheetRef,
  commentInputRef,
  selectedPlace,
  allRatings,
  isRatingOpen,
  setIsRatingOpen,
  ratingData,
  myRating,
  ratingValue,
  setRatingValue,
  comment,
  setComment,
  renderBackdrop,
  saveRating,
  startEditRating,
  deleteRating,
}: RatingBottomSheetProps) {
  const colors = useColors();
  const s = styles(colors);
  const snapPoints = useMemo(() => ['45%', '90%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={s.content}>
        <Pressable style={s.pressable} onPress={Keyboard.dismiss}>
          {selectedPlace && (
            <>
              <Text style={s.name}>{selectedPlace.name}</Text>

              {selectedPlace.category && (
                <>
                  <View style={s.row}>
                    <Text style={s.textSecondary}>Categoria:</Text>
                    <Text style={s.textTertiary}>{selectedPlace.category}</Text>
                  </View>
                  <View style={s.divider} />
                </>
              )}

              {selectedPlace.address && (
                <>
                  <View style={s.rowNoMargin}>
                    <Text style={s.textTertiary}>📍 {selectedPlace.address}</Text>
                  </View>
                  <View style={s.divider} />
                </>
              )}

              {selectedPlace.openingHours && (
                <>
                  <View style={s.rowNoMargin}>
                    <Text style={s.textTertiary}>🕐 {selectedPlace.openingHours}</Text>
                  </View>
                  <View style={s.divider} />
                </>
              )}

              <TouchableOpacity onPress={() => setIsRatingOpen(!isRatingOpen)}>
                <View style={s.summaryRow}>
                  <Text style={s.textTertiary}>⭐ {ratingData?.average?.toFixed(1) ?? '0.0'}</Text>
                  <StarRating value={ratingData?.average ?? 0} size={18} onChange={() => {}} readonly />
                  <Text style={s.textTertiary}>{ratingData?.count ?? 0} visitaram</Text>
                  <Text style={s.summaryToggle}>{isRatingOpen ? '▲' : '▼'}</Text>
                </View>
                <View style={s.divider} />
              </TouchableOpacity>

              {isRatingOpen && (
                <>
                  <RatingForm
                    commentInputRef={commentInputRef}
                    ratingValue={ratingValue}
                    onChangeRatingValue={setRatingValue}
                    comment={comment}
                    onChangeComment={setComment}
                    onSave={saveRating}
                  />

                  {allRatings.map((r) => {
                    const isMine = r.userId === user?.id;
                    const name = isMine ? `${user?.firstName} ${user?.lastName}` : r.userName ?? `Usuário ${r.userId}`;
                    return (
                      <ReviewItem
                        key={r.id}
                        review={r}
                        displayName={name}
                        isMine={isMine}
                        onEdit={() => startEditRating(r)}
                        onDelete={() => deleteRating(r)}
                      />
                    );
                  })}
                </>
              )}
            </>
          )}
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
