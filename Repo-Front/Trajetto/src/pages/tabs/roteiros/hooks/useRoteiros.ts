import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { getErrorMessage } from '@/utils/apiError';
import { showAlert } from '@/src/components/alerts/alertService';
import { useDestinationCarousel } from '@/src/pages/tabs/shared/hooks/useDestinationCarousel';

export function useRoteiros() {
  const destIndex = useDestinationCarousel();

  const { user } = useAuth();
  const router = useRouter();
  const { itinerary, itineraries, loading, fetchAllItineraries, deleteItinerary, activateItinerary } = useItineraryStore();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchAllItineraries(user.id);
    }, [user?.id])
  );

  // Sai do modo selecao quando os roteiros mudam (apos bulk delete)
  useEffect(() => {
    if (selectMode && itineraries.length === 0) exitSelectMode();
  }, [itineraries]);

  const enterSelectMode = (id: number) => {
    setSelectMode(true);
    setSelectedIds(new Set([id]));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(itineraries.map((i) => i.id)));

  const handleDelete = (id: number) => {
    if (!user) return;
    showAlert('Tem certeza que deseja excluir este roteiro?', {
      title: 'Excluir roteiro',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(id);
              await deleteItinerary(id, user.id);
            } catch (e) {
              showAlert(getErrorMessage(e, 'Não foi possível excluir o roteiro.'), { title: 'Erro' });
            } finally {
              setDeleting(null);
            }
          },
        },
      ],
    });
  };

  const handleBulkDelete = () => {
    if (!user || selectedIds.size === 0) return;
    showAlert(`Excluir ${selectedIds.size} roteiro${selectedIds.size > 1 ? 's' : ''}? Essa ação não pode ser desfeita.`, {
      title: 'Excluir roteiros',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              if (!user) return;
              await Promise.all([...selectedIds].map((id) => deleteItinerary(id, user.id)));
              exitSelectMode();
            } catch (e) {
              showAlert(getErrorMessage(e, 'Não foi possível excluir alguns roteiros.'), { title: 'Erro' });
            } finally {
              setBulkDeleting(false);
            }
          },
        },
      ],
    });
  };

  const handleActivate = async (id: number) => {
    if (!user) return;
    try {
      setActivating(id);
      await activateItinerary(id, user.id);
    } catch (e) {
      showAlert(getErrorMessage(e, 'Não foi possível ativar o roteiro.'), { title: 'Erro' });
    } finally {
      setActivating(null);
    }
  };

  return {
    destIndex,
    user,
    router,
    itinerary,
    itineraries,
    loading,
    deleting,
    activating,
    showGenerate,
    setShowGenerate,
    selectMode,
    selectedIds,
    bulkDeleting,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
    selectAll,
    handleDelete,
    handleBulkDelete,
    handleActivate,
  };
}
