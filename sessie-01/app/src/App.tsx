import { useEffect, useState } from 'react';
import type { Question } from './types';
import { loadQuestions, saveQuestions } from './storage';
import ManageView from './ManageView';
import VoteView from './VoteView';
import ResultsView from './ResultsView';

type Tab = 'beheren' | 'stemmen' | 'resultaten';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'beheren', label: 'Vragen beheren', icon: 'edit' },
  { id: 'stemmen', label: 'Stemmen', icon: 'check-mark' },
  { id: 'resultaten', label: 'Resultaten', icon: 'chart-line' },
];

export default function App() {
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions());
  const [tab, setTab] = useState<Tab>('beheren');

  // Bewaar elke wijziging direct in de browser (localStorage).
  useEffect(() => {
    saveQuestions(questions);
  }, [questions]);

  function registerVote(questionId: string, answerId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id !== questionId
          ? q
          : {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, votes: a.votes + 1 } : a,
              ),
            },
      ),
    );
  }

  function resetVotes() {
    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        answers: q.answers.map((a) => ({ ...a, votes: 0 })),
      })),
    );
  }

  return (
    <nldd-app-view>
      <div className="app">
        <header className="app-header">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              ▮▮▮
            </span>
            <div>
              <h1 className="brand-title">Stemwijzer</h1>
              <p className="brand-sub">
                Stel vragen, verzamel stemmen, analyseer de resultaten
              </p>
            </div>
          </div>
          <nav className="tabs" aria-label="Hoofdnavigatie">
            {TABS.map((t) => (
              <nldd-button
                key={t.id}
                variant={tab === t.id ? 'primary' : 'neutral-transparent'}
                start-icon={t.icon}
                text={t.label}
                onClick={() => setTab(t.id)}
              ></nldd-button>
            ))}
          </nav>
        </header>

        <main className="app-main">
          {tab === 'beheren' && (
            <ManageView questions={questions} setQuestions={setQuestions} />
          )}
          {tab === 'stemmen' && (
            <VoteView
              questions={questions}
              registerVote={registerVote}
              goToResults={() => setTab('resultaten')}
            />
          )}
          {tab === 'resultaten' && (
            <ResultsView questions={questions} resetVotes={resetVotes} />
          )}
        </main>
      </div>
    </nldd-app-view>
  );
}
