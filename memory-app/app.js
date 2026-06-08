const STORAGE_KEY = "japanese-memory-app-cards";

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
let currentCard = cards[0] || { ...seedCards[0] };
let currentFilter = "all";
let reviewIndex = 0;
let reviewBack = false;
let quizAnswer = null;

const views = {
  study: document.querySelector("#studyView"),
  library: document.querySelector("#libraryView"),
  review: document.querySelector("#reviewView"),
  quiz: document.querySelector("#quizView"),
};

const cardPreview = document.querySelector("#cardPreview");
const mnemonicEdit = document.querySelector("#mnemonicEdit");
const noteEdit = document.querySelector("#noteEdit");
const libraryList = document.querySelector("#libraryList");
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

function findCard(query) {
  const term = normalize(query);
  return (
    seedCards.find((card) => {
      return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo]
        .map(normalize)
        .some((value) => value.includes(term) || term.includes(value));
    }) || null
  );
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

function selectCard(card) {
  currentCard = withReviewDefaults({ ...card });
  mnemonicEdit.value = currentCard.mnemonic;
  noteEdit.value = currentCard.note || "";
  renderCardPreview();
}

function renderCardPreview() {
  if (!currentCard) return;

  const kanjiHtml = currentCard.kanjiNotes && currentCard.kanjiNotes.length
    ? `<div class="kanji-list">${currentCard.kanjiNotes
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
        .join("")}</div>`
    : `<p class="muted">한자 없는 단어입니다. 소리와 사용 장면 중심으로 외우세요.</p>`;

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
  selectCard(findCard(query) || createFallbackCard(query));
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
