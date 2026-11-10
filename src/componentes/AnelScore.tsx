import { faixaDoScore } from '../regras/score';

const COR: Record<ReturnType<typeof faixaDoScore>, string> = {
  verde: 'var(--grafico-verde)',
  amarelo: 'var(--grafico-amarelo)',
  vermelho: 'var(--grafico-vermelho)',
};

/** Anel de 0 a 100 com o número no meio, na cor da faixa. */
export function AnelScore({ total, tamanho = 112 }: { total: number; tamanho?: number }) {
  const raio = 46;
  const volta = 2 * Math.PI * raio;
  const cor = COR[faixaDoScore(total)];
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" role="img" aria-label={`Score ${total} de 100`}>
      <circle cx="50" cy="50" r={raio} fill="none" stroke="var(--superficie-2)" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={raio} fill="none" stroke={cor} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={volta} strokeDashoffset={volta * (1 - Math.max(0, Math.min(100, total)) / 100)}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="30" fontWeight="800" fill="var(--texto)">
        {total}
      </text>
    </svg>
  );
}
