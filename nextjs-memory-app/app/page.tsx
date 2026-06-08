"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { makeReview, seedCards, withReviewDefaults } from "@/lib/cards";
import { GeneratedCardPayload, WordCard } from "@/lib/types";

const STORAGE_KEY = "japanese-memory-next-cards";

type ViewName = "study" | "library" | "review" | "quiz";
type ApiMode = "idle" | "loading" | "ai" | "oauth" | "mock" | "fallback" | "error";

export default function Home() {
  const [cards, setCards] = useState<WordCard[]>(seedCards.map(withReviewDefaults));
  const [currentCard, setCurrentCard] = useState<WordCard>(seedCards[0]);
  const [view, setView] = useState<ViewName>("study");
  const [query, setQuery] = useState("");
  const [mnemonicDraft, setMnemonicDraft] = useState(seedCards[0].mnemonic);
  const [noteDraft, setNoteDraft] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "weak">("all");
  const [reviewBack, setReviewBack] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [quizCard, setQuizCard] = useState<WordCard>(seedCards[0]);
  const [quizResult, setQuizResult] = useState("");
  const [apiMode, setApiMode] = useState<ApiMode>("idle");
  const [apiMessage, setApiMessage] = useState("OPENAI_API_KEY가 없으면 mock으로 동작합니다.");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as WordCard[];
      if (parsed.length) {
        const restored = parsed.map(withReviewDefaults);
        setCards(restored);
        setCurrentCard(restored[0]);
        setMnemonicDraft(restored[0].mnemonic);
        setNoteDraft(restored[0].note || "");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const dueCards = useMemo(() => cards.filter(isDue), [cards]);
  const knownCount = useMemo(() => cards.reduce((sum, card) => sum + card.review.remembered, 0), [cards]);

  const libraryCards = useMemo(() => {
    if (filter === "due") return cards.filter(isDue);
    if (filter === "weak") return cards.filter((card) => card.review.confused > card.review.remembered);
    return cards;
  }, [cards, filter]);

  const activeReviewCard = (dueCards.length ? dueCards : cards)[reviewIndex % Math.max(cards.length, 1)];
  const quizOptions = useMemo(() => {
    const others = cards.filter((card) => card.id !== quizCard.id).slice(0, 3);
    return shuffle([quizCard, ...others]);
  }, [cards, quizCard]);

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setApiMode("loading");
    setApiMessage("카드를 생성하는 중입니다.");

    try {
      const response = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed })
      });

      const data = (await response.json()) as {
        card?: GeneratedCardPayload;
        mode?: "ai" | "oauth" | "mock" | "fallback";
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.card) {
        throw new Error(data.error || "카드 생성에 실패했습니다.");
      }

      const card = hydrateGeneratedCard(data.card);
      selectCard(card);
      setApiMode(data.mode || "ai");
      setApiMessage(data.message || (data.mode === "ai" ? "OpenAI로 카드를 생성했습니다." : "Fallback 카드가 생성됐습니다."));
    } catch (error) {
      setApiMode("error");
      setApiMessage(error instanceof Error ? error.message : "카드 생성에 실패했습니다.");
    }
  }

  function selectCard(card: WordCard) {
    setCurrentCard(card);
    setMnemonicDraft(card.mnemonic);
    setNoteDraft(card.note || "");
    setView("study");
  }

  function saveCard() {
    const edited: WordCard = {
      ...currentCard,
      mnemonic: mnemonicDraft.trim() || currentCard.mnemonic,
      note: noteDraft.trim(),
      updatedAt: new Date().toISOString()
    };

    setCards((previous) => {
      const index = previous.findIndex((card) => card.id === edited.id);
      if (index < 0) return [edited, ...previous];
      return previous.map((card) => (card.id === edited.id ? { ...edited, review: card.review } : card));
    });
    setCurrentCard(edited);
    setApiMessage("단어장에 저장했습니다.");
  }

  function resetSamples() {
    const restored = seedCards.map(withReviewDefaults);
    setCards(restored);
    selectCard(restored[0]);
    setApiMode("idle");
    setApiMessage("샘플 단어장을 초기화했습니다.");
  }

  function markReview(remembered: boolean) {
    if (!activeReviewCard) return;

    setCards((previous) =>
      previous.map((card) => {
        if (card.id !== activeReviewCard.id) return card;
        const nextInterval = remembered ? nextIntervalDays(card.review.intervalDays) : 0;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + nextInterval);

        return {
          ...card,
          review: {
            ...card.review,
            status: remembered ? "remembered" : "confused",
            intervalDays: nextInterval,
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: nextDate.toISOString(),
            remembered: card.review.remembered + (remembered ? 1 : 0),
            confused: card.review.confused + (remembered ? 0 : 1)
          }
        };
      })
    );

    setReviewBack(false);
    setReviewIndex((value) => value + 1);
  }

  function nextQuiz() {
    setQuizCard(cards[Math.floor(Math.random() * cards.length)] || seedCards[0]);
    setQuizResult("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">音</div>
          <div>
            <h1>소리장면 일본어</h1>
            <p>발음 하나, 뜻 하나, 장면 하나</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="주요 화면">
          {[
            ["study", "학습"],
            ["library", "단어장"],
            ["review", "복습"],
            ["quiz", "퀴즈"]
          ].map(([name, label]) => (
            <button key={name} className={`nav-tab ${view === name ? "active" : ""}`} onClick={() => setView(name as ViewName)}>
              {label}
            </button>
          ))}
        </nav>

        <section className="stats-panel">
          <div>
            <span>{cards.length}</span>
            <small>저장 단어</small>
          </div>
          <div>
            <span>{dueCards.length}</span>
            <small>오늘 복습</small>
          </div>
          <div>
            <span>{knownCount}</span>
            <small>기억남</small>
          </div>
        </section>

        <section className="sample-panel">
          <h2>빠른 예시</h2>
          <div className="sample-buttons">
            {seedCards.map((card) => (
              <button key={card.id} onClick={() => selectCard(card)}>
                {card.expression}
              </button>
            ))}
          </div>
        </section>
      </aside>

      <main className="workspace">
        {view === "study" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">OpenAI API 연결형 MVP</p>
                <h2>단어를 입력하면 경선식 스타일 카드 생성</h2>
              </div>
              <button className="ghost-button" onClick={resetSamples}>
                샘플 초기화
              </button>
            </div>

            <form className="word-form" onSubmit={handleGenerate}>
              <label htmlFor="wordInput">일본어 단어, 읽기, 한국어 힌트 입력</label>
              <div className="input-row">
                <input id="wordInput" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 지다이, 都会, 暑い, 공부하다" />
                <button disabled={apiMode === "loading"}>{apiMode === "loading" ? "생성 중" : "AI 카드 생성"}</button>
              </div>
              <p className={`status ${apiMode}`}>{apiMessage}</p>
            </form>

            <div className="study-grid">
              <WordCardView card={{ ...currentCard, mnemonic: mnemonicDraft }} />

              <aside className="editor-panel">
                <h3>내 암기문으로 다듬기</h3>
                <label htmlFor="mnemonicEdit">경선식 암기문</label>
                <textarea id="mnemonicEdit" rows={4} value={mnemonicDraft} onChange={(event) => setMnemonicDraft(event.target.value)} />
                <label htmlFor="noteEdit">내 메모</label>
                <textarea id="noteEdit" rows={4} value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="내가 만든 말장난, 헷갈리는 포인트" />
                <div className="button-row">
                  <button onClick={saveCard}>저장</button>
                  <button className="secondary-button" onClick={() => navigator.clipboard.writeText(mnemonicDraft)}>
                    암기문 복사
                  </button>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === "library" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">내 단어장</p>
                <h2>저장한 카드 관리</h2>
              </div>
              <div className="filter-group">
                {[
                  ["all", "전체"],
                  ["due", "오늘 복습"],
                  ["weak", "헷갈림"]
                ].map(([name, label]) => (
                  <button key={name} className={`filter-button ${filter === name ? "active" : ""}`} onClick={() => setFilter(name as typeof filter)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-list">
              {libraryCards.map((card) => (
                <article className="library-item" key={card.id}>
                  <h3>{card.expression}</h3>
                  <p className="muted">
                    {card.reading} {card.romaji ? `· ${card.romaji}` : ""}
                  </p>
                  <p>
                    <strong>{card.meaningKo}</strong>
                  </p>
                  <p>{card.mnemonic}</p>
                  {card.note && <p className="muted">메모: {card.note}</p>}
                  <div className="library-actions">
                    <button onClick={() => selectCard(card)}>열기</button>
                    <button className="secondary-button" onClick={() => setView("review")}>
                      복습
                    </button>
                    <button className="danger-button" onClick={() => setCards(cards.filter((item) => item.id !== card.id))}>
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "review" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">간격 반복</p>
                <h2>카드를 뒤집고 기억 상태 기록</h2>
              </div>
            </div>
            {activeReviewCard ? (
              <div className="review-layout">
                <article className="review-card" onClick={() => setReviewBack(!reviewBack)}>
                  {!reviewBack ? (
                    <div>
                      <p className="eyebrow">뜻을 떠올려 보세요</p>
                      <h3>{activeReviewCard.expression}</h3>
                      <p className="hint">{activeReviewCard.reading}</p>
                      <p className="muted">힌트: {extractHint(activeReviewCard.mnemonic)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="eyebrow">정답</p>
                      <h3>{activeReviewCard.meaningKo}</h3>
                      <p className="hint">{activeReviewCard.mnemonic}</p>
                      <p>{activeReviewCard.exampleJa}</p>
                      <p className="muted">{activeReviewCard.exampleKo}</p>
                    </div>
                  )}
                </article>
                <div className="review-actions">
                  <button className="secondary-button" onClick={() => setReviewBack(!reviewBack)}>
                    뒤집기
                  </button>
                  <button onClick={() => markReview(true)}>기억남</button>
                  <button className="danger-button" onClick={() => markReview(false)}>
                    헷갈림
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state">복습할 카드가 없습니다.</div>
            )}
          </section>
        )}

        {view === "quiz" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">퀴즈</p>
                <h2>암기문으로 뜻 떠올리기</h2>
              </div>
              <button className="secondary-button" onClick={nextQuiz}>
                다음 문제
              </button>
            </div>
            <article className="quiz-card">
              <p className="eyebrow">이 암기문이 가리키는 뜻은?</p>
              <h3>
                {quizCard.expression} <span className="muted">{quizCard.reading}</span>
              </h3>
              <div className="mnemonic">{quizCard.mnemonic}</div>
              <div className="quiz-options">
                {quizOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setQuizResult(option.id === quizCard.id ? "정답입니다." : "다시 확인해 보세요.");
                    }}
                  >
                    {option.meaningKo}
                  </button>
                ))}
              </div>
              {quizResult && <p className="status ai">{quizResult}</p>}
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

function WordCardView({ card }: { card: WordCard }) {
  return (
    <article className="word-card large-card">
      <div className="card-header">
        <div>
          <h3 className="expression">{card.expression}</h3>
          <p className="reading">
            {card.reading} {card.romaji ? `· ${card.romaji}` : ""}
          </p>
        </div>
        <div className="meaning-badge">{card.meaningKo}</div>
      </div>

      <section className="card-section">
        <h3>쉽게 말하면</h3>
        <p>{card.easyExplanation}</p>
      </section>

      <section className="card-section">
        <h3>경선식 암기</h3>
        <div className="mnemonic">{card.mnemonic}</div>
      </section>

      <section className="card-section">
        <h3>소리 핵심</h3>
        <p>
          <strong>{card.soundKo || card.reading}</strong>
        </p>
        <p>{card.pronunciationNote}</p>
      </section>

      <section className="card-section">
        <h3>한자 보강</h3>
        {card.kanjiNotes.length ? (
          <div className="kanji-list">
            {card.kanjiNotes.map((note) => (
              <div className="kanji-item" key={`${card.id}-${note.kanji}`}>
                <div className="kanji-char">{note.kanji}</div>
                <div>
                  <strong>
                    {note.koreanSound} · {note.meaning}
                  </strong>
                  <p>{note.easyStory}</p>
                  {note.meaningFlow && <p className="meaning-flow">{note.meaningFlow}</p>}
                  {note.components?.length ? (
                    <div className="component-list">
                      {note.components.map((component, index) => (
                        <div className="component-item" key={`${card.id}-${note.kanji}-${component.shape}-${index}`}>
                          <span className="component-shape">{component.shape}</span>
                          <div>
                            <strong>{component.name}</strong>
                            <p>
                              의미: {component.meaning} · 역할: {component.role}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">한자 없는 단어입니다. 소리와 사용 장면 중심으로 외우세요.</p>
        )}
      </section>

      <section className="card-section">
        <h3>예문</h3>
        <p>
          <strong>{card.exampleJa}</strong>
        </p>
        {card.exampleReading && <p className="muted">{card.exampleReading}</p>}
        <p>{card.exampleKo}</p>
      </section>
    </article>
  );
}

function hydrateGeneratedCard(payload: GeneratedCardPayload): WordCard {
  const now = new Date().toISOString();
  return {
    ...payload,
    id: `${payload.expression}-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    note: "",
    review: makeReview(),
    kanjiNotes: payload.kanjiNotes || []
  };
}

function isDue(card: WordCard) {
  return new Date(card.review.nextReviewAt) <= new Date();
}

function nextIntervalDays(current: number) {
  if (current <= 0) return 1;
  if (current === 1) return 3;
  if (current === 3) return 7;
  if (current === 7) return 14;
  return 30;
}

function extractHint(mnemonic: string) {
  const quoted = mnemonic.match(/[“"](.*?)[”"]/);
  if (quoted) return quoted[1];
  return mnemonic.split(/[,.!。]/)[0];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
