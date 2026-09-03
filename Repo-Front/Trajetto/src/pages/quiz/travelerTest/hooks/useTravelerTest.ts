import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services';

export type TravelerTestData = {
  fromProfile: boolean;
  skipping: boolean;
  handleSkip: () => Promise<void>;
  goToQuiz: () => void;
};

export function useTravelerTest(): TravelerTestData {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const fromProfile = source === 'profile';

  const [skipping, setSkipping] = useState(false);

  const handleSkip = async () => {
    if (fromProfile) {
      router.back();
      return;
    }
    try {
      setSkipping(true);
      await userService.updateTravelerProfile('SKIPPED');
      await refreshUser();
      router.replace('/(tabs)');
    } catch {
      router.replace('/(tabs)');
    } finally {
      setSkipping(false);
    }
  };

  return {
    fromProfile,
    skipping,
    handleSkip,
    goToQuiz: () =>
      router.replace({
        pathname: '/QuizScreen',
        params: fromProfile ? { source: 'profile' } : undefined,
      }),
  };
}
