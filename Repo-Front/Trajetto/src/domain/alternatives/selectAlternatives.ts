import { Place } from '@/services';

type CurrentPlace = {
  name: string;
  category?: string | null;
};

const shuffle = <T>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

const pick = (list: Place[], n: number): Place[] => shuffle(list).slice(0, n);

/**
 * Escolhe ate 3 lugares alternativos pra substituir `currentPlace` no roteiro:
 * ate 2 da mesma categoria + 1 de categoria diferente. Se a combinacao nao render
 * nada (ex: pouca variedade na regiao), cai pra 3 aleatorios entre os disponiveis.
 *
 * `currentNames` sao os nomes ja presentes no roteiro (nao repete parada).
 */
export function selectAlternatives(
  candidates: Place[],
  currentPlace: CurrentPlace,
  currentNames: Set<string>,
): Place[] {
  const available = candidates.filter(
    (p) => p.name !== currentPlace.name && !currentNames.has(p.name)
  );

  const sameCategory = available.filter((p) => p.category === currentPlace.category);
  const same2 = pick(sameCategory, 2);

  const same2Names = new Set(same2.map((p) => p.name));
  const different = available.filter(
    (p) => p.category !== currentPlace.category && !same2Names.has(p.name)
  );
  const diff1 = pick(different, 1);

  const result = [...same2, ...diff1];
  return result.length === 0 ? pick(available, 3) : result;
}
