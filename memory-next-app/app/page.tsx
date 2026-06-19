"use client";

import { FormEvent, Fragment, useEffect, useMemo, useState } from "react";
import { makeReview, seedCards, withReviewDefaults } from "@/lib/cards";
import { GeneratedCardPayload, KanjiNote, WordCard } from "@/lib/types";

const STORAGE_KEY = "japanese-memory-next-cards";
const STATIC_DB_URL = "/data/jlpt-all-cards-index.json";

type ViewName = "study" | "kanji" | "search" | "library" | "review" | "quiz";
type ApiMode = "idle" | "loading" | "ai" | "oauth" | "mock" | "fallback" | "error";
type KanjiStudyEntry = {
  kanji: string;
  koreanSound: string;
  meaning: string;
  easyStory: string;
  words: WordCard[];
};

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
  const [apiMessage, setApiMessage] = useState("로컬 DB를 먼저 검색하고, 없으면 API fallback을 사용합니다.");
  const [staticCards, setStaticCards] = useState<WordCard[]>(seedCards.map(withReviewDefaults));
  const [staticDbLoaded, setStaticDbLoaded] = useState(false);
  const [wordStudyLevel, setWordStudyLevel] = useState<"all" | "N5" | "N4" | "N3">("all");
  const [kanjiStudyLevel, setKanjiStudyLevel] = useState<"all" | "N5" | "N4" | "N3">("all");
  const [wordStudyQuery, setWordStudyQuery] = useState("");
  const [kanjiStudyQuery, setKanjiStudyQuery] = useState("");
  const [searchCard, setSearchCard] = useState<WordCard | null>(null);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [analyzingCardId, setAnalyzingCardId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setStorageLoaded(true);
      return;
    }

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
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, storageLoaded]);

  useEffect(() => {
    let cancelled = false;

    fetch(STATIC_DB_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<WordCard[]>;
      })
      .then((dbCards) => {
        if (cancelled) return;
        const byId = new Map<string, WordCard>();
        [...seedCards.map(withReviewDefaults), ...dbCards.map(withReviewDefaults)].forEach((card) => {
          byId.set(card.id, card);
        });
        const loaded = Array.from(byId.values());
        setStaticCards(loaded);
        setStaticDbLoaded(true);
        setApiMessage(`검색 DB ${loaded.length}개를 불러왔습니다.`);
      })
      .catch((error) => {
        console.warn("검색 DB를 불러오지 못했습니다.", error);
        if (!cancelled) {
          setStaticDbLoaded(false);
          setApiMessage("검색 DB를 불러오지 못해 샘플과 API fallback만 사용합니다.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dueCards = useMemo(() => cards.filter(isDue), [cards]);
  const knownCount = useMemo(() => cards.reduce((sum, card) => sum + card.review.remembered, 0), [cards]);

  const libraryCards = useMemo(() => {
    if (filter === "due") return cards.filter(isDue);
    if (filter === "weak") return cards.filter((card) => card.review.confused > card.review.remembered);
    return cards;
  }, [cards, filter]);

  const wordGroups = useMemo(
    () => {
      const levels = (["N5", "N4", "N3"] as const).filter((level) => wordStudyLevel === "all" || level === wordStudyLevel);
      return levels.map((level) => ({
        level,
        cards: staticCards.filter((card) => card.jlptLevel === level && cardMatchesQuery(card, wordStudyQuery))
      }));
    },
    [staticCards, wordStudyLevel, wordStudyQuery]
  );

  const kanjiGroups = useMemo(
    () => {
      const levels = (["N5", "N4", "N3"] as const).filter((level) => kanjiStudyLevel === "all" || level === kanjiStudyLevel);
      return levels.map((level) => {
        const entries = new Map<string, KanjiStudyEntry>();
        staticCards
          .filter((card) => card.jlptLevel === level)
          .forEach((card) => {
            const notes = new Map((card.kanjiNotes || []).map((note) => [note.kanji, note]));
            const chars = Array.from(new Set(card.expression.match(/[\u3400-\u9fff]/g) || []));
            chars.forEach((kanji) => {
              const note = notes.get(kanji);
              if (!entries.has(kanji)) {
                entries.set(kanji, {
                  kanji,
                  koreanSound: note?.koreanSound || "확인 필요",
                  meaning: note?.meaning || "단어에서 확인",
                  easyStory: note?.easyStory || `${kanji}가 들어간 단어들을 먼저 묶어서 외우세요.`,
                  words: []
                });
              }
              const entry = entries.get(kanji);
              if (entry && entry.words.length < 5) entry.words.push(card);
            });
          });
        return { level, kanji: Array.from(entries.values()).filter((entry) => kanjiEntryMatchesQuery(entry, kanjiStudyQuery)) };
      });
    },
    [staticCards, kanjiStudyLevel, kanjiStudyQuery]
  );

  const visibleWordCount = useMemo(() => wordGroups.reduce((sum, group) => sum + group.cards.length, 0), [wordGroups]);
  const visibleKanjiCount = useMemo(() => kanjiGroups.reduce((sum, group) => sum + group.kanji.length, 0), [kanjiGroups]);
  const firstWordMatch = useMemo(() => wordGroups.find((group) => group.cards.length)?.cards[0] || null, [wordGroups]);
  const studyDisplayCard = wordStudyQuery.trim() && firstWordMatch ? firstWordMatch : currentCard;

  useEffect(() => {
    if (!wordStudyQuery.trim()) return;
    if (firstWordMatch && firstWordMatch.id !== currentCard.id) {
      selectCard(firstWordMatch, null);
    }
  }, [firstWordMatch, wordStudyQuery, currentCard.id]);

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
    setApiMessage("로컬 DB를 검색하는 중입니다.");

    const localCard = findLocalCard(trimmed, [...cards, ...staticCards]);
    if (localCard) {
      setSearchCard(withReviewDefaults(localCard));
      setApiMode("mock");
      setApiMessage("로컬 DB에서 찾은 검색 결과입니다.");
      return;
    }

    setApiMessage("로컬 DB에 없어 API fallback을 확인하는 중입니다.");

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
      setSearchCard(card);
      setApiMode(data.mode || "ai");
      setApiMessage(data.message || (data.mode === "ai" ? "OpenAI로 카드를 생성했습니다." : "Fallback 카드가 생성됐습니다."));
    } catch (error) {
      setApiMode("error");
      setApiMessage(error instanceof Error ? error.message : "카드 생성에 실패했습니다.");
    }
  }

  async function analyzeSearchCard() {
    if (!searchCard) return;
    await analyzeCard(searchCard, "search");
  }

  async function analyzeCard(card: WordCard, target: "search" | "study" = "study") {
    setAnalyzingCardId(card.id);

    setApiMode("loading");
    setApiMessage("API로 카드 내용을 정밀 분석하는 중입니다.");

    try {
      const response = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: card.expression })
      });

      const data = (await response.json()) as {
        card?: GeneratedCardPayload;
        mode?: "ai" | "oauth" | "mock" | "fallback";
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.card) {
        throw new Error(data.error || "API 분석에 실패했습니다.");
      }

      const analyzed = mergeAnalyzedCard(card, data.card);
      setStaticCards((previous) => previous.map((item) => (item.id === card.id ? analyzed : item)));
      setCards((previous) => {
        const exists = previous.some((item) => item.id === card.id);
        if (!exists) return [{ ...analyzed, review: makeReview(), note: "" }, ...previous];
        return previous.map((item) => (item.id === card.id ? { ...analyzed, review: item.review, note: item.note || "" } : item));
      });
      if (target === "search") setSearchCard(analyzed);
      if (currentCard.id === card.id || target === "study") {
        selectCard(analyzed, null);
      }
      setExpandedWordId(card.id);
      setApiMode(data.mode || "ai");
      setApiMessage(data.message || "API 분석 결과로 카드를 업데이트했습니다.");
    } catch (error) {
      setApiMode("error");
      setApiMessage(error instanceof Error ? error.message : "API 분석에 실패했습니다.");
    } finally {
      setAnalyzingCardId(null);
    }
  }

  function selectCard(card: WordCard, nextView: ViewName | null = "study") {
    setCurrentCard(card);
    setMnemonicDraft(card.mnemonic);
    setNoteDraft(card.note || "");
    if (nextView) setView(nextView);
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

  function saveStaticCard(card: WordCard) {
    const saved: WordCard = {
      ...withReviewDefaults(card),
      updatedAt: new Date().toISOString()
    };

    setCards((previous) => {
      const exists = previous.some((item) => item.id === saved.id);
      if (!exists) return [saved, ...previous];
      return previous.map((item) => (item.id === saved.id ? { ...saved, review: item.review } : item));
    });
    setApiMessage("DB 카드를 단어장에 저장했습니다.");
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
            ["study", "단어학습"],
            ["kanji", "한자학습"],
            ["search", "검색"],
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
            {staticDbLoaded && <span className="db-count">DB {staticCards.length}개</span>}
          </div>
        </section>
      </aside>

      <main className="workspace">
        {view === "study" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">JLPT 단어학습</p>
                <h2>N5, N4, N3 챕터별 단어를 고르고 카드로 외우기</h2>
              </div>
              <button className="ghost-button" onClick={resetSamples}>
                샘플 초기화
              </button>
            </div>

            <div className="learning-tools">
              <LevelFilter value={wordStudyLevel} onChange={setWordStudyLevel} label="단어 레벨 필터" />
              <input className="inline-search" value={wordStudyQuery} onChange={(event) => setWordStudyQuery(event.target.value)} placeholder="단어학습에서 검색" />
            </div>
            <div className="db-summary">{staticDbLoaded ? `표시 ${visibleWordCount}개 단어` : "샘플 단어만 표시 중"}</div>
            <div className="db-level-sections learning-sections">
              {wordGroups.map(({ level, cards: levelCards }) => (
                <section className="db-level-section" key={level} aria-label={`${level} 단어`}>
                  <div className="db-level-header">
                    <div>
                      <p className="eyebrow">{level}</p>
                      <h3>{level} 챕터</h3>
                    </div>
                    <span>{levelCards.length}개</span>
                  </div>
                  <div className="db-word-grid">
                    {levelCards.map((card) => (
                      <Fragment key={card.id}>
                        <article className="db-word-item">
                          <button
                            className="db-word-main"
                            type="button"
                            onClick={() => {
                              selectCard(card, null);
                              setExpandedWordId((value) => (value === card.id ? null : card.id));
                            }}
                          >
                            <strong>{card.expression}</strong>
                            <span>
                              {card.reading}
                              {card.romaji ? ` · ${card.romaji}` : ""}
                            </span>
                            <small>{card.meaningKo}</small>
                          </button>
                          <button className="secondary-button db-save-button" type="button" onClick={() => saveStaticCard(card)}>
                            저장
                          </button>
                          {needsApiAnalysis(card) && (
                            <button className="secondary-button db-save-button" type="button" disabled={analyzingCardId === card.id} onClick={() => analyzeCard(card)}>
                              {analyzingCardId === card.id ? "분석 중" : "API 분석"}
                            </button>
                          )}
                        </article>
                        {expandedWordId === card.id && (
                          <div className="inline-word-detail">
                            <WordCardView card={card} />
                            <div className="button-row search-result-actions">
                              <button type="button" onClick={() => saveStaticCard(card)}>
                                단어장 저장
                              </button>
                              {needsApiAnalysis(card) && (
                                <button className="secondary-button" type="button" disabled={analyzingCardId === card.id} onClick={() => analyzeCard(card)}>
                                  {analyzingCardId === card.id ? "분석 중" : "API로 뜻/카드 보강"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {!expandedWordId && (
              <div className="study-grid">
              <WordCardView card={studyDisplayCard.id === currentCard.id ? { ...currentCard, mnemonic: mnemonicDraft } : studyDisplayCard} />

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
            )}
          </section>
        )}

        {view === "kanji" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">JLPT 한자학습</p>
                <h2>N5, N4, N3 단어에서 나온 한자를 따로 보기</h2>
              </div>
            </div>

            <div className="learning-tools">
              <LevelFilter value={kanjiStudyLevel} onChange={setKanjiStudyLevel} label="한자 레벨 필터" />
              <input className="inline-search" value={kanjiStudyQuery} onChange={(event) => setKanjiStudyQuery(event.target.value)} placeholder="한자학습에서 검색" />
            </div>
            <div className="db-summary">표시 {visibleKanjiCount}개 한자</div>
            <div className="db-level-sections">
              {kanjiGroups.map(({ level, kanji }) => (
                <section className="db-level-section" key={level} aria-label={`${level} 한자`}>
                  <div className="db-level-header">
                    <div>
                      <p className="eyebrow">{level}</p>
                      <h3>{level} 한자</h3>
                    </div>
                    <span>{kanji.length}개</span>
                  </div>
                  <div className="kanji-study-grid">
                    {kanji.map((entry) => (
                      <article className="kanji-study-item" key={`${level}-${entry.kanji}`}>
                        <div className="kanji-char">{entry.kanji}</div>
                        <div>
                          <h3>
                            {entry.koreanSound} · {entry.meaning}
                          </h3>
                          <p>{entry.easyStory}</p>
                          <div className="kanji-word-links">
                            {entry.words.map((word) => (
                              <button className="secondary-button" type="button" key={word.id} onClick={() => selectCard(word)}>
                                {word.expression} · {word.meaningKo}
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        )}

        {view === "search" && (
          <section>
            <div className="topbar">
              <div>
                <p className="eyebrow">사전 검색</p>
                <h2>모르는 단어, 읽기, 뜻, 한자를 빠르게 찾기</h2>
              </div>
            </div>

            <form className="word-form search-form" onSubmit={handleGenerate}>
              <label htmlFor="wordInput">일본어 단어, 읽기, 한국어 뜻 입력</label>
              <div className="input-row">
                <input id="wordInput" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예: 지다이, 都会, 暑い, 공부하다" />
                <button disabled={apiMode === "loading"}>{apiMode === "loading" ? "검색 중" : "검색"}</button>
              </div>
              <p className={`status ${apiMode}`}>{apiMessage}</p>
            </form>
            <div className="search-result">
              {searchCard ? (
                <>
                  <WordCardView card={searchCard} />
                  <div className="button-row search-result-actions">
                    <button type="button" onClick={() => saveStaticCard(searchCard)}>
                      단어장 저장
                    </button>
                    {needsApiAnalysis(searchCard) && (
                      <button className="secondary-button" type="button" disabled={apiMode === "loading"} onClick={analyzeSearchCard}>
                        {analyzingCardId === searchCard.id ? "분석 중" : "API로 정밀 분석"}
                      </button>
                    )}
                    <button className="secondary-button" type="button" onClick={() => selectCard(searchCard)}>
                      단어학습에서 열기
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">검색하면 이 화면 안에 결과 카드가 표시됩니다.</div>
              )}
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
  const kanjiNotes = getDisplayKanjiNotes(card);

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
        {kanjiNotes.length ? (
          <div className="kanji-list">
            {kanjiNotes.map((note) => (
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

function LevelFilter({
  value,
  onChange,
  label
}: {
  value: "all" | "N5" | "N4" | "N3";
  onChange: (value: "all" | "N5" | "N4" | "N3") => void;
  label: string;
}) {
  return (
    <div className="level-filter" role="group" aria-label={label}>
      {[
        ["all", "전체"],
        ["N5", "N5"],
        ["N4", "N4"],
        ["N3", "N3"]
      ].map(([level, text]) => (
        <button key={level} className={`filter-button ${value === level ? "active" : ""}`} type="button" onClick={() => onChange(level as "all" | "N5" | "N4" | "N3")}>
          {text}
        </button>
      ))}
    </div>
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

function mergeAnalyzedCard(base: WordCard, payload: GeneratedCardPayload): WordCard {
  return {
    ...base,
    ...payload,
    id: base.id,
    createdAt: base.createdAt,
    updatedAt: new Date().toISOString(),
    note: base.note || "",
    review: base.review,
    source: payload.source || "ai",
    jlptLevel: base.jlptLevel,
    kanjiNotes: Array.isArray(payload.kanjiNotes) ? payload.kanjiNotes : []
  };
}

function extractKanjiChars(value: string) {
  return Array.from(new Set(value.match(/[\u3400-\u9fff]/g) || []));
}

function getDisplayKanjiNotes(card: WordCard): KanjiNote[] {
  if (card.kanjiNotes.length) return card.kanjiNotes;
  return extractKanjiChars(card.expression).map((kanji) => ({
    kanji,
    koreanSound: "분석 대기",
    meaning: "API 분석 필요",
    easyStory: `${kanji}가 들어간 한자 단어입니다. API로 정밀 분석을 누르면 뜻, 구성요소, 암기 스토리를 채울 수 있습니다.`
  }));
}

function needsApiAnalysis(card: WordCard) {
  return (
    card.source !== "ai" &&
    (card.meaningKo === "뜻 확인 필요" ||
      !card.exampleJa ||
      !card.exampleKo ||
      !card.kanjiNotes.length ||
      card.pronunciationNote.includes("AI 분석 전") ||
      card.mnemonic.includes("암기문을 추가"))
  );
}

function normalizeSearch(value: string) {
  return String(value || "").trim().toLowerCase();
}

function searchTerms(query: string) {
  const term = normalizeSearch(query);
  if (!term) return [];
  const terms = [term];
  if (term.endsWith("하다") && term.length > 2) terms.push(term.slice(0, -2));
  return terms;
}

function findLocalCard(query: string, candidates: WordCard[]) {
  const term = normalizeSearch(query);
  const terms = searchTerms(query);
  const fields = (card: WordCard) => [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo].map(normalizeSearch);

  const exact = candidates.find((card) => fields(card).some((value) => value === term));
  if (exact) return exact;

  return candidates.find((card) => fields(card).some((value) => searchValueMatches(terms, value))) || null;
}

function searchValueMatches(terms: string[], value: string) {
  if (!value) return false;
  return terms.some((term) => term && value.includes(term));
}

function cardMatchesQuery(card: WordCard, query: string) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo, card.partOfSpeech]
    .map(normalizeSearch)
    .some((value) => searchValueMatches(terms, value));
}

function kanjiEntryMatchesQuery(entry: KanjiStudyEntry, query: string) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  const baseFields = [entry.kanji, entry.koreanSound, entry.meaning, entry.easyStory].map(normalizeSearch);
  const wordFields = entry.words.flatMap((word) => [word.expression, word.reading, word.romaji, word.meaningKo]).map(normalizeSearch);
  return [...baseFields, ...wordFields].some((value) => searchValueMatches(terms, value));
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
