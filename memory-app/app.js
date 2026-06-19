const STORAGE_KEY = "japanese-memory-app-cards";
const STATIC_DB_URL = "./data/jlpt-all-cards-index.json";

const seedCards = [
  {
    id: "mori",
    expression: "森",
    reading: "もり",
    romaji: "mori",
    meaningKo: "숲",
    partOfSpeech: "명사",
    soundKo: "모리",
    mnemonic: "나무가 모리모리 모여 있는 곳이 숲.",
    easyExplanation: "森는 나무가 아주 많이 모여 있는 숲이에요.",
    kanjiNotes: [
      {
        kanji: "森",
        koreanSound: "삼",
        meaning: "숲",
        easyStory: "木가 세 개 모이면 나무가 빽빽한 숲이 됩니다.",
      },
    ],
    pronunciationNote: "짧게 모-리 2박자로 읽습니다.",
    exampleJa: "森に行きます。",
    exampleReading: "もりに いきます。",
    exampleKo: "숲에 갑니다.",
    source: "jlpt",
    jlptLevel: "N5",
  },
  {
    id: "chizu",
    expression: "地図",
    reading: "ちず",
    romaji: "chizu",
    meaningKo: "지도",
    partOfSpeech: "명사",
    soundKo: "치즈",
    mnemonic: "길 잃고 치즈 사진 찍을 게 아니라, 地図 지도를 봐야 한다.",
    easyExplanation: "地図는 땅을 그림으로 그려놓은 지도예요.",
    kanjiNotes: [
      { kanji: "地", koreanSound: "지", meaning: "땅", easyStory: "地는 땅과 장소를 뜻합니다." },
      { kanji: "図", koreanSound: "도", meaning: "그림", easyStory: "図는 그림이나 도면을 뜻합니다." },
    ],
    pronunciationNote: "음식 치즈 チーズ는 길게, 지도 ちず는 짧게 읽습니다.",
    exampleJa: "地図を見ます。",
    exampleReading: "ちずを みます。",
    exampleKo: "지도를 봅니다.",
    source: "jlpt",
    jlptLevel: "N5",
  },
  {
    id: "tokai",
    expression: "都会",
    reading: "とかい",
    romaji: "tokai",
    meaningKo: "도시, 도회지",
    partOfSpeech: "명사",
    soundKo: "토카이",
    mnemonic: "또 가이? 사람들이 또 가는 곳, 사람 몰리는 곳이 都会 도시.",
    easyExplanation: "都会는 시골이 아니라 사람이 많고 건물도 많은 번화한 도시를 말해요.",
    kanjiNotes: [
      { kanji: "都", koreanSound: "도", meaning: "큰 도시", easyStory: "都는 사람들이 모인 큰 도읍입니다." },
      { kanji: "会", koreanSound: "회", meaning: "모임", easyStory: "会는 사람들이 모이는 느낌입니다." },
    ],
    pronunciationNote: "と・かい보다 とかい 한 덩어리로 토카이라고 기억하세요.",
    exampleJa: "東京は都会です。",
    exampleReading: "とうきょうは とかいです。",
    exampleKo: "도쿄는 도시입니다.",
    source: "ai",
    jlptLevel: "N4",
  },
  {
    id: "jidai",
    expression: "時代",
    reading: "じだい",
    romaji: "jidai",
    meaningKo: "시대",
    partOfSpeech: "명사",
    soundKo: "지다이",
    mnemonic: "시간이 지다이, 지나다 보니 한 시대가 된다.",
    easyExplanation: "時代는 어떤 일이 벌어지던 큰 시기, 시대를 말해요.",
    kanjiNotes: [
      { kanji: "時", koreanSound: "시", meaning: "시간", easyStory: "時는 시간이 흐르는 것을 뜻합니다." },
      { kanji: "代", koreanSound: "대", meaning: "세대, 시기", easyStory: "代는 사람이나 세대가 바뀌는 차례입니다." },
    ],
    pronunciationNote: "じだい를 지다이 한 덩어리로 읽습니다.",
    exampleJa: "今はAIの時代です。",
    exampleReading: "いまは AI の じだいです。",
    exampleKo: "지금은 AI의 시대입니다.",
    source: "ai",
    jlptLevel: "N4",
  },
  {
    id: "atsui",
    expression: "暑い",
    reading: "あつい",
    romaji: "atsui",
    meaningKo: "덥다",
    partOfSpeech: "い형용사",
    soundKo: "아츠이",
    mnemonic: "아, 뜨시다! 너무 더워서 あつい.",
    easyExplanation: "暑い는 날씨나 공기가 더울 때 쓰는 말이에요.",
    kanjiNotes: [
      { kanji: "暑", koreanSound: "서", meaning: "덥다", easyStory: "해가 강하게 내리쬐는 더운 날을 떠올리면 됩니다." },
    ],
    pronunciationNote: "끝의 い는 형용사 꼬리라 따로 외우지 않아도 됩니다.",
    exampleJa: "今日は暑いです。",
    exampleReading: "きょうは あついです。",
    exampleKo: "오늘은 덥습니다.",
    source: "jlpt",
    jlptLevel: "N5",
  },
  {
    id: "chiizu",
    expression: "チーズ",
    reading: "チーズ",
    romaji: "chiizu",
    meaningKo: "치즈",
    partOfSpeech: "명사",
    soundKo: "치-즈",
    mnemonic: "치즈가 쭉 늘어나는 만큼 チー를 길게 끌어 チーズ.",
    easyExplanation: "チーズ는 한국어 치즈와 거의 같은 외래어예요.",
    kanjiNotes: [],
    pronunciationNote: "가운데 ー는 한 박자 길게 끄는 장음입니다.",
    exampleJa: "チーズが好きです。",
    exampleReading: "チーズが すきです。",
    exampleKo: "치즈를 좋아합니다.",
    source: "jlpt",
    jlptLevel: "N5",
  },
];

let cards = loadCards();
let staticCards = [...seedCards];
let staticDbLoaded = false;
let currentCard = cards[0] || { ...seedCards[0] };
let currentFilter = "all";
let wordStudyLevel = "all";
let kanjiStudyLevel = "all";
let wordStudyQuery = "";
let kanjiStudyQuery = "";
let searchResultCard = null;
let reviewIndex = 0;
let reviewBack = false;
let quizAnswer = null;

const views = {
  study: document.querySelector("#studyView"),
  kanji: document.querySelector("#kanjiView"),
  search: document.querySelector("#searchView"),
  library: document.querySelector("#libraryView"),
  review: document.querySelector("#reviewView"),
  quiz: document.querySelector("#quizView"),
};

const cardPreview = document.querySelector("#cardPreview");
const mnemonicEdit = document.querySelector("#mnemonicEdit");
const noteEdit = document.querySelector("#noteEdit");
const libraryList = document.querySelector("#libraryList");
const wordLevelSections = document.querySelector("#wordLevelSections");
const wordSummary = document.querySelector("#wordSummary");
const wordLevelFilter = document.querySelector("#wordLevelFilter");
const wordStudySearch = document.querySelector("#wordStudySearch");
const kanjiLevelSections = document.querySelector("#kanjiLevelSections");
const kanjiSummary = document.querySelector("#kanjiSummary");
const kanjiLevelFilter = document.querySelector("#kanjiLevelFilter");
const kanjiStudySearch = document.querySelector("#kanjiStudySearch");
const searchResult = document.querySelector("#searchResult");
const reviewCard = document.querySelector("#reviewCard");
const quizCard = document.querySelector("#quizCard");

function loadCards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return seedCards.map(withReviewDefaults);
  }

  try {
    const parsed = JSON.parse(saved);
    return parsed.length ? parsed.map(withReviewDefaults) : seedCards.map(withReviewDefaults);
  } catch {
    return seedCards.map(withReviewDefaults);
  }
}

function persistCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  renderStats();
}

function withReviewDefaults(card) {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    note: "",
    review: {
      status: "new",
      intervalDays: 0,
      lastReviewedAt: null,
      nextReviewAt: now,
      remembered: 0,
      confused: 0,
    },
    ...card,
    review: {
      status: "new",
      intervalDays: 0,
      lastReviewedAt: null,
      nextReviewAt: now,
      remembered: 0,
      confused: 0,
      ...(card.review || {}),
    },
  };
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function searchTerms(query) {
  const term = normalize(query);
  if (!term) return [];
  const terms = [term];
  if (term.endsWith("하다") && term.length > 2) terms.push(term.slice(0, -2));
  return terms;
}

function findCard(query) {
  const term = normalize(query);
  const terms = searchTerms(query);
  const searchableCards = [...cards, ...staticCards];
  const exactMatch = searchableCards.find((card) => {
    return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo]
      .map(normalize)
      .some((value) => value === term);
  });

  if (exactMatch) return exactMatch;

  return searchableCards.find((card) => {
    return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo]
      .map(normalize)
      .some((value) => searchValueMatches(terms, value));
  }) || null;
}

function searchValueMatches(terms, value) {
  if (!value) return false;
  return terms.some((term) => term && value.includes(term));
}

function cardMatches(card, query) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo, card.partOfSpeech]
    .map(normalize)
    .some((value) => searchValueMatches(terms, value));
}

function kanjiEntryMatches(entry, query) {
  const terms = searchTerms(query);
  if (!terms.length) return true;
  const baseFields = [entry.kanji, entry.koreanSound, entry.meaning, entry.easyStory].map(normalize);
  const wordFields = entry.words.flatMap((word) => [word.expression, word.reading, word.romaji, word.meaningKo]).map(normalize);
  return [...baseFields, ...wordFields].some((value) => searchValueMatches(terms, value));
}

async function loadStaticDb() {
  try {
    const response = await fetch(STATIC_DB_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const dbCards = await response.json();
    const byId = new Map();

    [...seedCards, ...dbCards].forEach((card) => {
      byId.set(card.id, withReviewDefaults(card));
    });

    staticCards = Array.from(byId.values());
    staticDbLoaded = true;
    renderSamples();
    renderWordStudy();
    renderKanjiStudy();
    showToast(`검색 DB ${staticCards.length}개를 불러왔습니다.`);
  } catch (error) {
    staticDbLoaded = false;
    console.warn("검색 DB를 불러오지 못했습니다.", error);
    renderWordStudy();
    renderKanjiStudy();
    showToast("검색 DB를 불러오지 못해 샘플만 사용합니다.");
  }
}

function createFallbackCard(query) {
  const cleaned = query.trim();
  const id = `custom-${Date.now()}`;
  return withReviewDefaults({
    id,
    expression: cleaned,
    reading: cleaned,
    romaji: "",
    meaningKo: "뜻을 직접 입력해 주세요",
    partOfSpeech: "직접 추가",
    soundKo: cleaned,
    mnemonic: `${cleaned}의 소리와 뜻을 연결하는 내 암기문을 직접 적어보세요.`,
    easyExplanation: "아직 내장 단어장에 없는 단어입니다. 암기문과 뜻을 수정해서 저장할 수 있어요.",
    kanjiNotes: [],
    pronunciationNote: "AI API가 붙으면 이 영역에서 자동 분석 결과를 제공할 수 있습니다.",
    exampleJa: `${cleaned}を覚えます。`,
    exampleReading: "",
    exampleKo: `${cleaned}를 외웁니다.`,
    source: "user",
  });
}

function extractKanjiChars(value) {
  return Array.from(new Set(String(value || "").match(/[\u3400-\u9fff]/g) || []));
}

function getDisplayKanjiNotes(card) {
  if (card.kanjiNotes && card.kanjiNotes.length) return card.kanjiNotes;
  return extractKanjiChars(card.expression).map((kanji) => ({
    kanji,
    koreanSound: "분석 대기",
    meaning: "API 분석 필요",
    easyStory: `${kanji}가 들어간 한자 단어입니다. API로 정밀 분석을 누르면 뜻, 구성요소, 암기 스토리를 채울 수 있습니다.`
  }));
}

function renderKanjiNotesHtml(card) {
  const notes = getDisplayKanjiNotes(card);
  if (!notes.length) {
    return `<p class="muted">한자 없는 단어입니다. 소리와 사용 장면 중심으로 외우세요.</p>`;
  }

  return `<div class="kanji-list">${notes
    .map(
      (note) => `
        <div class="kanji-item">
          <div class="kanji-char">${escapeHtml(note.kanji)}</div>
          <div>
            <strong>${escapeHtml(note.koreanSound)} · ${escapeHtml(note.meaning)}</strong>
            <p>${escapeHtml(note.easyStory)}</p>
          </div>
        </div>
      `,
    )
    .join("")}</div>`;
}

function selectCard(card) {
  currentCard = withReviewDefaults({ ...card });
  mnemonicEdit.value = currentCard.mnemonic;
  noteEdit.value = currentCard.note || "";
  renderCardPreview();
}

function renderCardPreview() {
  if (!currentCard) return;
  const kanjiHtml = renderKanjiNotesHtml(currentCard);

  cardPreview.innerHTML = `
    <div class="card-header">
      <div>
        <h3 class="expression">${escapeHtml(currentCard.expression)}</h3>
        <p class="reading">${escapeHtml(currentCard.reading)} ${currentCard.romaji ? `· ${escapeHtml(currentCard.romaji)}` : ""}</p>
      </div>
      <div class="meaning-badge">${escapeHtml(currentCard.meaningKo)}</div>
    </div>
    <section class="card-section">
      <h3>쉽게 말하면</h3>
      <p>${escapeHtml(currentCard.easyExplanation)}</p>
    </section>
    <section class="card-section">
      <h3>경선식 암기</h3>
      <div class="mnemonic">${escapeHtml(currentCard.mnemonic)}</div>
    </section>
    <section class="card-section">
      <h3>소리 핵심</h3>
      <p><strong>${escapeHtml(currentCard.soundKo || currentCard.reading)}</strong></p>
      <p>${escapeHtml(currentCard.pronunciationNote || "전체 발음과 뜻을 한 장면으로 묶어 기억하세요.")}</p>
    </section>
    <section class="card-section">
      <h3>한자 보강</h3>
      ${kanjiHtml}
    </section>
    <section class="card-section">
      <h3>예문</h3>
      <p><strong>${escapeHtml(currentCard.exampleJa)}</strong></p>
      ${currentCard.exampleReading ? `<p class="muted">${escapeHtml(currentCard.exampleReading)}</p>` : ""}
      <p>${escapeHtml(currentCard.exampleKo)}</p>
    </section>
  `;
}

function renderCardHtml(card) {
  const kanjiHtml = renderKanjiNotesHtml(card);

  return `
    <article class="word-card large-card">
      <div class="card-header">
        <div>
          <h3 class="expression">${escapeHtml(card.expression)}</h3>
          <p class="reading">${escapeHtml(card.reading)} ${card.romaji ? `· ${escapeHtml(card.romaji)}` : ""}</p>
        </div>
        <div class="meaning-badge">${escapeHtml(card.meaningKo)}</div>
      </div>
      <section class="card-section">
        <h3>쉽게 말하면</h3>
        <p>${escapeHtml(card.easyExplanation)}</p>
      </section>
      <section class="card-section">
        <h3>경선식 암기</h3>
        <div class="mnemonic">${escapeHtml(card.mnemonic)}</div>
      </section>
      <section class="card-section">
        <h3>소리 핵심</h3>
        <p><strong>${escapeHtml(card.soundKo || card.reading)}</strong></p>
        <p>${escapeHtml(card.pronunciationNote || "전체 발음과 뜻을 한 장면으로 묶어 기억하세요.")}</p>
      </section>
      <section class="card-section">
        <h3>한자 보강</h3>
        ${kanjiHtml}
      </section>
      <section class="card-section">
        <h3>예문</h3>
        <p><strong>${escapeHtml(card.exampleJa)}</strong></p>
        ${card.exampleReading ? `<p class="muted">${escapeHtml(card.exampleReading)}</p>` : ""}
        <p>${escapeHtml(card.exampleKo)}</p>
      </section>
      <div class="button-row search-result-actions">
        <button type="button" data-search-save="${escapeHtml(card.id)}">단어장 저장</button>
        <button class="secondary-button" type="button" data-search-study="${escapeHtml(card.id)}">단어학습에서 열기</button>
      </div>
    </article>
  `;
}

function renderSearchResult(card, message) {
  if (!searchResult) return;
  if (!card) {
    searchResult.innerHTML = `<div class="empty-state">${escapeHtml(message || "검색하면 이 화면 안에 결과 카드가 표시됩니다.")}</div>`;
    return;
  }
  searchResultCard = withReviewDefaults(card);
  searchResult.innerHTML = `
    <p class="status mock">${escapeHtml(message || "검색 결과입니다.")}</p>
    ${renderCardHtml(searchResultCard)}
  `;
}

function saveCurrentCard() {
  const edited = withReviewDefaults({
    ...currentCard,
    mnemonic: mnemonicEdit.value.trim() || currentCard.mnemonic,
    note: noteEdit.value.trim(),
    updatedAt: new Date().toISOString(),
  });

  const existingIndex = cards.findIndex((card) => card.id === edited.id);
  if (existingIndex >= 0) {
    cards[existingIndex] = { ...cards[existingIndex], ...edited, review: cards[existingIndex].review };
  } else {
    cards.unshift(edited);
  }

  currentCard = cards.find((card) => card.id === edited.id);
  persistCards();
  renderAll();
  showToast("단어장에 저장했습니다.");
}

function saveCardToLibrary(card) {
  const saved = withReviewDefaults({ ...card, updatedAt: new Date().toISOString() });
  const exists = cards.some((item) => item.id === saved.id);
  cards = exists ? cards.map((item) => (item.id === saved.id ? { ...saved, review: item.review } : item)) : [saved, ...cards];
  persistCards();
  renderAll();
  return exists;
}

function renderStats() {
  const dueCards = getDueCards();
  document.querySelector("#savedCount").textContent = cards.length;
  document.querySelector("#dueCount").textContent = dueCards.length;
  document.querySelector("#knownCount").textContent = cards.reduce((sum, card) => sum + ((card.review && card.review.remembered) || 0), 0);
}

function renderSamples() {
  const sampleButtons = document.querySelector("#sampleButtons");
  sampleButtons.innerHTML = seedCards
    .map((card) => `<button type="button" data-sample="${card.id}">${escapeHtml(card.expression)}</button>`)
    .join("");
  if (staticDbLoaded) {
    sampleButtons.insertAdjacentHTML("beforeend", `<span class="db-count">DB ${staticCards.length}개</span>`);
  }
}

function renderLibrary() {
  const filtered = cards.filter((card) => {
    if (currentFilter === "due") return isDue(card);
    if (currentFilter === "weak") return ((card.review && card.review.confused) || 0) > ((card.review && card.review.remembered) || 0);
    return true;
  });

  if (!filtered.length) {
    libraryList.innerHTML = `<div class="empty-state">조건에 맞는 카드가 없습니다. 학습 화면에서 단어를 저장하세요.</div>`;
    return;
  }

  libraryList.innerHTML = filtered
    .map(
      (card) => `
        <article class="library-item">
          <h3>${escapeHtml(card.expression)}</h3>
          <p class="muted">${escapeHtml(card.reading)} ${card.romaji ? `· ${escapeHtml(card.romaji)}` : ""}</p>
          <p><strong>${escapeHtml(card.meaningKo)}</strong></p>
          <p>${escapeHtml(card.mnemonic)}</p>
          ${card.note ? `<p class="muted">메모: ${escapeHtml(card.note)}</p>` : ""}
          <div class="library-actions">
            <button type="button" data-open="${card.id}">열기</button>
            <button class="secondary-button" type="button" data-review-now="${card.id}">복습</button>
            <button class="danger-button" type="button" data-delete="${card.id}">삭제</button>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderWordStudy() {
  if (!wordLevelSections || !wordSummary) return;

  const levels = ["N5", "N4", "N3"];
  const visibleLevels = wordStudyLevel === "all" ? levels : levels.filter((level) => level === wordStudyLevel);
  const byLevel = visibleLevels.map((level) => ({
    level,
    cards: staticCards.filter((card) => card.jlptLevel === level && cardMatches(card, wordStudyQuery))
  }));
  const total = byLevel.reduce((sum, group) => sum + group.cards.length, 0);

  wordSummary.textContent = staticDbLoaded ? `표시 ${total}개 단어` : "샘플 단어만 표시 중";

  const firstMatchGroup = byLevel.find((group) => group.cards.length);
  const firstMatch = firstMatchGroup ? firstMatchGroup.cards[0] : null;
  if (wordStudyQuery.trim() && firstMatch && currentCard.id !== firstMatch.id) {
    selectCard(firstMatch);
  }

  wordLevelSections.innerHTML = byLevel
    .map(
      ({ level, cards: levelCards }) => `
        <section class="db-level-section" aria-label="${level} 단어">
          <div class="db-level-header">
            <div>
              <p class="eyebrow">${level}</p>
              <h3>${level} 챕터</h3>
            </div>
            <span>${levelCards.length}개</span>
          </div>
          <div class="db-word-grid">
            ${levelCards
              .map(
                (card) => `
                  <article class="db-word-item">
                    <button class="db-word-main" type="button" data-word-open="${escapeHtml(card.id)}">
                      <strong>${escapeHtml(card.expression)}</strong>
                      <span>${escapeHtml(card.reading)}${card.romaji ? ` · ${escapeHtml(card.romaji)}` : ""}</span>
                      <small>${escapeHtml(card.meaningKo)}</small>
                    </button>
                    <button class="secondary-button db-save-button" type="button" data-word-save="${escapeHtml(card.id)}">저장</button>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function buildKanjiGroups() {
  const levels = ["N5", "N4", "N3"];
  const visibleLevels = kanjiStudyLevel === "all" ? levels : levels.filter((level) => level === kanjiStudyLevel);
  return visibleLevels.map((level) => {
    const entries = new Map();
    staticCards
      .filter((card) => card.jlptLevel === level)
      .forEach((card) => {
        const notes = new Map((card.kanjiNotes || []).map((note) => [note.kanji, note]));
        const chars = Array.from(new Set(String(card.expression || "").match(/[\u3400-\u9fff]/g) || []));
        chars.forEach((kanji) => {
          const note = notes.get(kanji) || {};
          if (!entries.has(kanji)) {
            entries.set(kanji, {
              kanji,
              koreanSound: note.koreanSound || "확인 필요",
              meaning: note.meaning || "단어에서 확인",
              easyStory: note.easyStory || `${kanji}가 들어간 단어들을 먼저 묶어서 외우세요.`,
              words: []
            });
          }
          const entry = entries.get(kanji);
          if (entry.words.length < 5) entry.words.push(card);
        });
      });
    return { level, kanji: Array.from(entries.values()).filter((entry) => kanjiEntryMatches(entry, kanjiStudyQuery)) };
  });
}

function renderKanjiStudy() {
  if (!kanjiLevelSections || !kanjiSummary) return;

  const groups = buildKanjiGroups();
  const total = groups.reduce((sum, group) => sum + group.kanji.length, 0);
  kanjiSummary.textContent = staticDbLoaded ? `표시 ${total}개 한자` : "샘플 한자만 표시 중";

  kanjiLevelSections.innerHTML = groups
    .map(
      ({ level, kanji }) => `
        <section class="db-level-section" aria-label="${level} 한자">
          <div class="db-level-header">
            <div>
              <p class="eyebrow">${level}</p>
              <h3>${level} 한자</h3>
            </div>
            <span>${kanji.length}개</span>
          </div>
          <div class="kanji-study-grid">
            ${kanji
              .map(
                (entry) => `
                  <article class="kanji-study-item">
                    <div class="kanji-char">${escapeHtml(entry.kanji)}</div>
                    <div>
                      <h3>${escapeHtml(entry.koreanSound)} · ${escapeHtml(entry.meaning)}</h3>
                      <p>${escapeHtml(entry.easyStory)}</p>
                      <div class="kanji-word-links">
                        ${entry.words
                          .map(
                            (word) => `
                              <button class="secondary-button" type="button" data-kanji-word="${escapeHtml(word.id)}">
                                ${escapeHtml(word.expression)} · ${escapeHtml(word.meaningKo)}
                              </button>
                            `,
                          )
                          .join("")}
                      </div>
                    </div>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function getDueCards() {
  return cards.filter(isDue);
}

function isDue(card) {
  const next = card.review && card.review.nextReviewAt ? new Date(card.review.nextReviewAt) : new Date(0);
  return next <= new Date();
}

function renderReview() {
  const dueCards = getDueCards();
  const source = dueCards.length ? dueCards : cards;
  const card = source[reviewIndex % source.length];

  if (!card) {
    reviewCard.innerHTML = `<div class="empty-state">복습할 카드가 없습니다. 먼저 단어를 저장하세요.</div>`;
    return;
  }

  if (reviewBack) {
    reviewCard.innerHTML = `
      <div>
        <p class="eyebrow">정답</p>
        <h3>${escapeHtml(card.meaningKo)}</h3>
        <p class="hint">${escapeHtml(card.mnemonic)}</p>
        <p>${escapeHtml(card.exampleJa)}</p>
        <p class="muted">${escapeHtml(card.exampleKo)}</p>
      </div>
    `;
  } else {
    reviewCard.innerHTML = `
      <div>
        <p class="eyebrow">뜻을 떠올려 보세요</p>
        <h3>${escapeHtml(card.expression)}</h3>
        <p class="hint">${escapeHtml(card.reading)}</p>
        <p class="muted">${extractHint(card.mnemonic)}</p>
      </div>
    `;
  }
}

function markReview(remembered) {
  const dueCards = getDueCards();
  const source = dueCards.length ? dueCards : cards;
  const active = source[reviewIndex % source.length];
  if (!active) return;

  const index = cards.findIndex((card) => card.id === active.id);
  const card = cards[index];
  const previousInterval = (card.review && card.review.intervalDays) || 0;
  const nextInterval = remembered ? nextIntervalDays(previousInterval) : 0;
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextInterval);

  cards[index] = {
    ...card,
    review: {
      ...card.review,
      status: remembered ? "remembered" : "confused",
      intervalDays: nextInterval,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: nextDate.toISOString(),
      remembered: ((card.review && card.review.remembered) || 0) + (remembered ? 1 : 0),
      confused: ((card.review && card.review.confused) || 0) + (remembered ? 0 : 1),
    },
  };

  reviewIndex += 1;
  reviewBack = false;
  persistCards();
  renderAll();
}

function nextIntervalDays(current) {
  if (current <= 0) return 1;
  if (current === 1) return 3;
  if (current === 3) return 7;
  if (current === 7) return 14;
  return 30;
}

function renderQuiz() {
  if (!cards.length) {
    quizCard.innerHTML = `<div class="empty-state">퀴즈를 만들 카드가 없습니다.</div>`;
    return;
  }

  const card = cards[Math.floor(Math.random() * cards.length)];
  quizAnswer = card.id;
  const options = shuffle([card, ...shuffle(cards.filter((item) => item.id !== card.id)).slice(0, 3)]);

  quizCard.innerHTML = `
    <p class="eyebrow">이 암기문이 가리키는 뜻은?</p>
    <h3>${escapeHtml(card.expression)} <span class="muted">${escapeHtml(card.reading)}</span></h3>
    <div class="mnemonic">${escapeHtml(card.mnemonic)}</div>
    <div class="quiz-options">
      ${options
        .map((option) => `<button type="button" data-quiz-option="${option.id}">${escapeHtml(option.meaningKo)}</button>`)
        .join("")}
    </div>
  `;
}

function renderAll() {
  renderStats();
  renderCardPreview();
  renderLibrary();
  renderReview();
}

function switchView(viewName) {
  Object.entries(views).forEach(([name, element]) => {
    element.classList.toggle("active", name === viewName);
  });
  document.querySelectorAll(".nav-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  if (viewName === "quiz") renderQuiz();
  if (viewName === "review") renderReview();
  if (viewName === "study") renderWordStudy();
  if (viewName === "kanji") renderKanjiStudy();
}

function extractHint(mnemonic) {
  const quoted = mnemonic.match(/[“"](.*?)[”"]/);
  if (quoted) return `힌트: ${quoted[1]}`;
  return `힌트: ${mnemonic.split(/[,.!。]/)[0]}`;
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "position:fixed;right:20px;bottom:20px;background:#171512;color:white;padding:12px 16px;border-radius:8px;z-index:10;box-shadow:0 12px 30px rgba(0,0,0,.22)";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

document.querySelector("#wordForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#wordInput");
  const query = input.value.trim();
  if (!query) return;
  const found = findCard(query);
  renderSearchResult(found || createFallbackCard(query), found ? "DB에서 찾은 검색 결과입니다." : "DB에 없어 직접 입력 카드로 만들었습니다.");
  showToast(found ? "검색 DB에서 카드를 찾았습니다." : "DB에 없어 직접 입력 카드로 만들었습니다.");
});

document.querySelector("#saveCardBtn").addEventListener("click", saveCurrentCard);

document.querySelector("#copyMnemonicBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(mnemonicEdit.value || currentCard.mnemonic);
  showToast("암기문을 복사했습니다.");
});

document.querySelector("#resetDemoBtn").addEventListener("click", () => {
  cards = seedCards.map(withReviewDefaults);
  persistCards();
  selectCard(cards[0]);
  renderAll();
  showToast("샘플 단어장을 초기화했습니다.");
});

wordLevelFilter.addEventListener("click", (event) => {
  const target = event.target.closest("[data-level]");
  if (!target) return;
  wordStudyLevel = target.dataset.level;
  wordLevelFilter.querySelectorAll("[data-level]").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
  renderWordStudy();
});

wordStudySearch.addEventListener("input", (event) => {
  wordStudyQuery = event.target.value;
  renderWordStudy();
});

kanjiLevelFilter.addEventListener("click", (event) => {
  const target = event.target.closest("[data-level]");
  if (!target) return;
  kanjiStudyLevel = target.dataset.level;
  kanjiLevelFilter.querySelectorAll("[data-level]").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
  renderKanjiStudy();
});

kanjiStudySearch.addEventListener("input", (event) => {
  kanjiStudyQuery = event.target.value;
  renderKanjiStudy();
});

document.querySelectorAll(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelector("#sampleButtons").addEventListener("click", (event) => {
  const target = event.target.closest("[data-sample]");
  if (!target) return;
  const card = seedCards.find((item) => item.id === target.dataset.sample);
  if (card) selectCard(card);
});

document.querySelector(".filter-group").addEventListener("click", (event) => {
  const target = event.target.closest("[data-filter]");
  if (!target) return;
  currentFilter = target.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
  renderLibrary();
});

libraryList.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open]");
  const reviewButton = event.target.closest("[data-review-now]");
  const deleteButton = event.target.closest("[data-delete]");

  if (openButton) {
    const card = cards.find((item) => item.id === openButton.dataset.open);
    if (card) {
      selectCard(card);
      switchView("study");
    }
  }

  if (reviewButton) {
    const index = cards.findIndex((item) => item.id === reviewButton.dataset.reviewNow);
    if (index >= 0) {
      reviewIndex = index;
      reviewBack = false;
      switchView("review");
    }
  }

  if (deleteButton) {
    cards = cards.filter((item) => item.id !== deleteButton.dataset.delete);
    persistCards();
    renderAll();
  }
});

wordLevelSections.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-word-open]");
  const saveButton = event.target.closest("[data-word-save]");

  if (openButton) {
    const card = staticCards.find((item) => item.id === openButton.dataset.wordOpen);
    if (card) {
      selectCard(card);
      cardPreview.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (saveButton) {
    const card = staticCards.find((item) => item.id === saveButton.dataset.wordSave);
    if (!card) return;
    const exists = saveCardToLibrary(card);
    showToast(exists ? "이미 저장된 카드를 갱신했습니다." : "DB 카드를 단어장에 저장했습니다.");
  }
});

searchResult.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-search-save]");
  const studyButton = event.target.closest("[data-search-study]");
  if (!searchResultCard) return;

  if (saveButton) {
    const exists = saveCardToLibrary(searchResultCard);
    showToast(exists ? "이미 저장된 카드를 갱신했습니다." : "검색 결과를 단어장에 저장했습니다.");
  }

  if (studyButton) {
    selectCard(searchResultCard);
    switchView("study");
  }
});

kanjiLevelSections.addEventListener("click", (event) => {
  const wordButton = event.target.closest("[data-kanji-word]");
  if (!wordButton) return;
  const card = staticCards.find((item) => item.id === wordButton.dataset.kanjiWord);
  if (!card) return;
  selectCard(card);
  switchView("study");
  cardPreview.scrollIntoView({ behavior: "smooth", block: "start" });
});

reviewCard.addEventListener("click", () => {
  reviewBack = !reviewBack;
  renderReview();
});

reviewCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    reviewBack = !reviewBack;
    renderReview();
  }
});

document.querySelector("#flipReviewBtn").addEventListener("click", () => {
  reviewBack = !reviewBack;
  renderReview();
});

document.querySelector("#rememberBtn").addEventListener("click", () => markReview(true));
document.querySelector("#confusedBtn").addEventListener("click", () => markReview(false));
document.querySelector("#nextQuizBtn").addEventListener("click", renderQuiz);

quizCard.addEventListener("click", (event) => {
  const target = event.target.closest("[data-quiz-option]");
  if (!target) return;
  const correct = target.dataset.quizOption === quizAnswer;
  target.style.background = correct ? "#1f7a5c" : "#b94a48";
  target.style.color = "#fff";
  showToast(correct ? "정답입니다." : "다시 확인해 보세요.");
});

renderSamples();
selectCard(cards[0]);
renderAll();
renderWordStudy();
renderKanjiStudy();
loadStaticDb();
