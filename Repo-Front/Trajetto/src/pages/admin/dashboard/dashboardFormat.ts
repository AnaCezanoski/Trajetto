// Média nula não é zero: significa que não havia nada para entrar na conta.
export function umaCasa(valor: number | null | undefined) {
  return valor === null || valor === undefined ? '—' : valor.toFixed(1);
}
