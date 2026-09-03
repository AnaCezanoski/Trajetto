import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native';
import { RatingService, Rating, RatingSummary } from '@/services';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { useAuth } from '@/context/AuthContext';
import { Places } from '@/hooks/itineraryStore';

export function usePlaceRating() {
  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const commentInputRef = useRef<TextInput>(null);

  const [selectedPlace, setSelectedPlace] = useState<Places & { xid?: string } | null>(null);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingData, setRatingData] = useState<RatingSummary | undefined>();
  const [myRating, setMyRating] = useState<Rating | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');

  const openBottomSheet = (place: Places & { xid?: string }) => {
    setSelectedPlace(place);
    setIsRatingOpen(false);
    setRatingValue(0);
    setComment('');
    setMyRating(null);
    setAllRatings([]);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const refreshRatings = useCallback(async (xid: string) => {
    const summary = await RatingService.getSummary(xid);
    setRatingData(summary);
    const ratings = await RatingService.getByPlace(xid);
    setAllRatings(ratings);
  }, []);

  useEffect(() => {
    const xid = selectedPlace?.xid;
    if (!xid) return;
    RatingService.getSummary(xid).then(setRatingData).catch(() => {});
    RatingService.getByPlace(xid).then((ratings) => {
      setAllRatings(ratings);
      const mine = ratings.find((r) => r.userId === user?.id);
      setMyRating(mine ?? null);
    });
  }, [selectedPlace]);

  const saveRating = async () => {
    const xid = selectedPlace?.xid;
    if (!xid) return;
    try {
      if (myRating) {
        const updated = await RatingService.update(myRating.id, {
          userId: user?.id ?? 0,
          rating: ratingValue,
          comment,
        });
        setMyRating(updated);
      } else {
        const created = await RatingService.create({
          placeId: xid,
          userId: user?.id ?? 0,
          userName: `${user?.firstName} ${user?.lastName}`,
          rating: ratingValue,
          comment,
        });
        setMyRating(created);
      }
      setIsRatingOpen(false);
      await refreshRatings(xid);
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível salvar a avaliação.'), { title: 'Erro' });
    }
  };

  const startEditRating = (r: Rating) => {
    setMyRating(r);
    setRatingValue(r.rating);
    setComment(r.comment ?? '');
    setIsRatingOpen(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const deleteRating = (r: Rating) => {
    const xid = selectedPlace?.xid;
    if (!xid) return;
    showAlert('Tem certeza?', {
      title: 'Excluir avaliação',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await RatingService.delete(r.id, user?.id ?? 0);
              setMyRating(null);
              await refreshRatings(xid);
            } catch (e) {
              showAlert(getErrorMessage(e, 'Não foi possível excluir a avaliação.'), { title: 'Erro' });
            }
          },
        },
      ],
    });
  };

  return {
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
    openBottomSheet,
    renderBackdrop,
    saveRating,
    startEditRating,
    deleteRating,
  };
}
