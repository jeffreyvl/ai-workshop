import type { Answer } from './types';

// Horizontale staafdiagram, opgebouwd met CSS (geen externe library).
// Toont per antwoord het aantal stemmen en het percentage; het hoogst
// scorende antwoord wordt geaccentueerd.
export default function BarChart({ answers }: { answers: Answer[] }) {
  const total = answers.reduce((sum, a) => sum + a.votes, 0);
  const max = Math.max(1, ...answers.map((a) => a.votes));

  return (
    <div className="bars">
      {answers.map((a) => {
        const pct = total === 0 ? 0 : Math.round((a.votes / total) * 100);
        const width = (a.votes / max) * 100;
        const isTop = a.votes === max && a.votes > 0;
        return (
          <div className="bar-row" key={a.id}>
            <div className="bar-label">
              <span className="bar-text">{a.text}</span>
              <span className="bar-count">
                {a.votes} {a.votes === 1 ? 'stem' : 'stemmen'} · {pct}%
              </span>
            </div>
            <div className="bar-track">
              <div
                className={'bar-fill' + (isTop ? ' bar-fill--top' : '')}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
