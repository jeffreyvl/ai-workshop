import { useState } from 'react';
import type { Question } from './types';
import { newId } from './storage';

// Beheer-scherm: nieuwe vraag met antwoordopties opstellen en bestaande
// vragen bekijken/verwijderen.
export default function ManageView({
  questions,
  setQuestions,
}: {
  questions: Question[];
  setQuestions: (updater: (prev: Question[]) => Question[]) => void;
}) {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [error, setError] = useState('');

  function setOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, '']);
  }

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    const cleanTitle = title.trim();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!cleanTitle) {
      setError('Geef de vraag een titel.');
      return;
    }
    if (cleanOptions.length < 2) {
      setError('Geef minimaal twee antwoordopties op.');
      return;
    }
    const question: Question = {
      id: newId(),
      title: cleanTitle,
      createdAt: Date.now(),
      answers: cleanOptions.map((text) => ({ id: newId(), text, votes: 0 })),
    };
    setQuestions((prev) => [...prev, question]);
    setTitle('');
    setOptions(['', '']);
    setError('');
  }

  function deleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="stack">
      <section className="panel">
        <h2 className="panel-title">Nieuwe vraag</h2>

        <nldd-form-field label="Vraag">
          <nldd-text-field
            value={title}
            placeholder="Bijv. Welk thema heeft prioriteit?"
            onInput={(e: any) => setTitle(e.detail?.value ?? e.target?.value ?? '')}
          ></nldd-text-field>
        </nldd-form-field>

        <div className="field-group">
          <span className="field-group-label">Antwoordopties</span>
          {options.map((opt, i) => (
            <div className="option-row" key={i}>
              <nldd-text-field
                class="option-input"
                value={opt}
                placeholder={`Antwoord ${i + 1}`}
                onInput={(e: any) => setOption(i, e.detail?.value ?? e.target?.value ?? '')}
              ></nldd-text-field>
              {options.length > 2 && (
                <nldd-icon-button
                  icon="trash"
                  variant="critical-transparent"
                  accessible-label={`Antwoord ${i + 1} verwijderen`}
                  onClick={() => removeOption(i)}
                ></nldd-icon-button>
              )}
            </div>
          ))}
          <div>
            <nldd-button
              variant="secondary"
              size="sm"
              start-icon="plus"
              text="Antwoord toevoegen"
              onClick={addOption}
            ></nldd-button>
          </div>
        </div>

        {error && (
          <nldd-banner variant="critical" text={error}></nldd-banner>
        )}

        <div className="actions">
          <nldd-button
            variant="primary"
            start-icon="check-mark"
            text="Vraag opslaan"
            onClick={submit}
          ></nldd-button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          Opgeslagen vragen{' '}
          <span className="muted">({questions.length})</span>
        </h2>
        {questions.length === 0 ? (
          <p className="muted">Nog geen vragen. Voeg hierboven je eerste vraag toe.</p>
        ) : (
          <ol className="question-list">
            {questions.map((q, i) => {
              const total = q.answers.reduce((s, a) => s + a.votes, 0);
              return (
                <li className="question-item" key={q.id}>
                  <div>
                    <div className="question-item-title">
                      {i + 1}. {q.title}
                    </div>
                    <div className="muted">
                      {q.answers.length} antwoorden · {total}{' '}
                      {total === 1 ? 'stem' : 'stemmen'}
                    </div>
                  </div>
                  <nldd-icon-button
                    icon="trash"
                    variant="critical-transparent"
                    accessible-label={`Vraag "${q.title}" verwijderen`}
                    onClick={() => deleteQuestion(q.id)}
                  ></nldd-icon-button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
