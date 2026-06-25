import { useState } from 'react';
import type { Question } from './types';

// Stem-scherm: één vraag tegelijk, Mentimeter-stijl. Klik op een antwoord om
// een stem te registreren; daarna ga je door naar de volgende vraag.
export default function VoteView({
  questions,
  registerVote,
  goToResults,
}: {
  questions: Question[];
  registerVote: (questionId: string, answerId: string) => void;
  goToResults: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return (
      <section className="panel">
        <p className="muted">
          Er zijn nog geen vragen. Maak eerst een vraag aan bij{' '}
          <strong>Vragen beheren</strong>.
        </p>
      </section>
    );
  }

  if (done || index >= questions.length) {
    return (
      <section className="panel center">
        <nldd-icon name="check-mark" size="lg"></nldd-icon>
        <h2 className="panel-title">Bedankt voor het stemmen!</h2>
        <p className="muted">Alle vragen zijn beantwoord.</p>
        <div className="actions actions--center">
          <nldd-button
            variant="secondary"
            text="Opnieuw stemmen"
            start-icon="refresh"
            onClick={() => {
              setIndex(0);
              setDone(false);
            }}
          ></nldd-button>
          <nldd-button
            variant="primary"
            text="Bekijk resultaten"
            start-icon="chart-line"
            onClick={goToResults}
          ></nldd-button>
        </div>
      </section>
    );
  }

  const q = questions[index];

  function choose(answerId: string) {
    registerVote(q.id, answerId);
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  return (
    <section className="panel">
      <div className="vote-progress muted">
        Vraag {index + 1} van {questions.length}
      </div>
      <h2 className="vote-question">{q.title}</h2>
      <div className="vote-options">
        {q.answers.map((a) => (
          <nldd-button
            key={a.id}
            variant="secondary"
            size="lg"
            width="full"
            horizontal-alignment="left"
            text={a.text}
            onClick={() => choose(a.id)}
          ></nldd-button>
        ))}
      </div>
      <div className="actions actions--between">
        <nldd-button
          variant="neutral-transparent"
          text="Vorige"
          start-icon="arrow-left"
          disabled={index === 0 || undefined}
          onClick={() => setIndex(Math.max(0, index - 1))}
        ></nldd-button>
        <nldd-button
          variant="neutral-transparent"
          text="Overslaan"
          end-icon="arrow-right"
          onClick={() => {
            if (index + 1 >= questions.length) setDone(true);
            else setIndex(index + 1);
          }}
        ></nldd-button>
      </div>
    </section>
  );
}
