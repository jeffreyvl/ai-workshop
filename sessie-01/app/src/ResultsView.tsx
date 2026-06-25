import type { Question } from './types';
import BarChart from './BarChart';

// Resultaten-scherm: per vraag een staafdiagram met aantallen en percentages,
// plus een korte automatische analyse en knoppen om te resetten of te exporteren.
export default function ResultsView({
  questions,
  resetVotes,
}: {
  questions: Question[];
  resetVotes: () => void;
}) {
  const grandTotal = questions.reduce(
    (s, q) => s + q.answers.reduce((t, a) => t + a.votes, 0),
    0,
  );

  function exportJson() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stemresultaten.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (questions.length === 0) {
    return (
      <section className="panel">
        <p className="muted">
          Nog geen vragen om resultaten van te tonen. Maak eerst een vraag aan.
        </p>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="panel results-summary">
        <div>
          <div className="big-number">{grandTotal}</div>
          <div className="muted">stemmen in totaal · {questions.length} vragen</div>
        </div>
        <div className="actions">
          <nldd-button
            variant="secondary"
            start-icon="download"
            text="Exporteer (JSON)"
            onClick={exportJson}
          ></nldd-button>
          <nldd-button
            variant="destructive"
            start-icon="refresh"
            text="Stemmen resetten"
            onClick={() => {
              if (confirm('Alle stemmen op nul zetten? De vragen blijven staan.')) {
                resetVotes();
              }
            }}
          ></nldd-button>
        </div>
      </section>

      {questions.map((q, i) => {
        const total = q.answers.reduce((t, a) => t + a.votes, 0);
        const top = [...q.answers].sort((a, b) => b.votes - a.votes)[0];
        return (
          <section className="panel" key={q.id}>
            <h2 className="panel-title">
              {i + 1}. {q.title}
            </h2>
            <div className="muted result-meta">
              {total} {total === 1 ? 'stem' : 'stemmen'}
              {total > 0 && top.votes > 0 && (
                <>
                  {' '}
                  · meest gekozen: <strong>{top.text}</strong>
                </>
              )}
            </div>
            <BarChart answers={q.answers} />
          </section>
        );
      })}
    </div>
  );
}
