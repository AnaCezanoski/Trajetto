import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { quizData } from '@/data/quizData';
import { userService } from '@/services';
import { useAuth } from '@/context/AuthContext';

export type QuizResultData = {
  perfil: ReturnType<typeof getPerfil>;
  fromProfile: boolean;
  goBack: () => void;
};

function getPerfil(profile: string | undefined) {
  return quizData.perfis[profile ?? ''];
}

export function useQuizResult(): QuizResultData {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { profile, source } = useLocalSearchParams<{ profile: string; source?: string }>();
  const fromProfile = source === 'profile';

  const perfil = getPerfil(profile);

  useEffect(() => {
    if (profile) {
      userService.updateTravelerProfile(profile)
        .then(() => refreshUser())
        .catch(() => {});
    }
  }, [profile]);

  return {
    perfil,
    fromProfile,
    goBack: () => (fromProfile ? router.dismiss(2) : router.replace('/(tabs)')),
  };
}
