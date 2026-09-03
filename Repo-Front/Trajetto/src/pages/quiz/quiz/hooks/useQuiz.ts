import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { quizData, shuffle, calcularPerfil, Pergunta } from '@/data/quizData';
import { applyAnswerScore } from '@/src/domain/quiz/applyAnswerScore';

const INITIAL_SCORES: Record<string, number> = {
  AVENTUREIRO: 0, CULTURAL: 0, NATUREZA: 0, LUXO: 0,
  MOCHILEIRO: 0, RELAXAMENTO: 0, SOCIAL: 0, SOLITARIO: 0,
};

export type QuizData = {
  questions: Pergunta[];
  current: Pergunta | undefined;
  currentIndex: number;
  total: number;
  progress: number;
  selected: string | null;
  setSelected: (v: string) => void;
  handleNext: () => void;
  goBack: () => void;
};

export function useQuiz(): QuizData {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const [questions, setQuestions] = useState<Pergunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({ ...INITIAL_SCORES });

  useEffect(() => {
    setQuestions(shuffle([...quizData.perguntas]).slice(0, 10));
  }, []);

  const current = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? (currentIndex + 1) / total : 0;

  const handleNext = () => {
    if (!selected || !current) return;

    const newScores = applyAnswerScore(current, selected, scores);

    if (currentIndex === total - 1) {
      const perfil = calcularPerfil(newScores);
      const params: { profile: string; source?: string } = { profile: perfil };
      if (source) params.source = source;
      router.replace({ pathname: '/QuizResultScreen', params });
    } else {
      setScores(newScores);
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
    }
  };

  return {
    questions,
    current,
    currentIndex,
    total,
    progress,
    selected,
    setSelected,
    handleNext,
    goBack: () => router.back(),
  };
}
