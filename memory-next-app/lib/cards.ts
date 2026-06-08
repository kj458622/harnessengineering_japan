import { WordCard } from "./types";

export const seedCards: WordCard[] = [
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
        meaningFlow: "나무 한 그루가 아니라 여러 그루가 겹쳐 있으니 숲이라는 뜻이 자연스럽게 생깁니다.",
        components: [
          { shape: "木", name: "나무 목", meaning: "나무", role: "숲을 이루는 기본 재료" },
          { shape: "木 + 木 + 木", name: "나무 세 그루", meaning: "많은 나무", role: "빽빽하게 모인 숲의 이미지" }
        ]
      }
    ],
    pronunciationNote: "짧게 모-리 2박자로 읽습니다.",
    exampleJa: "森に行きます。",
    exampleReading: "もりに いきます。",
    exampleKo: "숲에 갑니다.",
    source: "jlpt",
    jlptLevel: "N5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    review: makeReview()
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
      {
        kanji: "地",
        koreanSound: "지",
        meaning: "땅",
        easyStory: "흙(土)이 있는 자리가 바로 땅과 장소입니다.",
        meaningFlow: "土가 들어가서 땅, 장소, 지면과 관련된 뜻을 만듭니다.",
        components: [
          { shape: "土", name: "흙 토", meaning: "흙, 땅", role: "땅이라는 핵심 뜻" },
          { shape: "也", name: "어조사 야", meaning: "소리/모양 보조", role: "글자의 소리와 형태를 보탬" }
        ]
      },
      {
        kanji: "図",
        koreanSound: "도",
        meaning: "그림",
        easyStory: "네모난 틀 안에 표시를 넣으면 지도나 도면이 됩니다.",
        meaningFlow: "틀 안에 선과 표시가 들어간 모습을 그림, 도면으로 떠올리면 쉽습니다.",
        components: [
          { shape: "囗", name: "에울 위", meaning: "둘러싼 틀", role: "종이나 공간의 테두리" },
          { shape: "内部 표시", name: "안쪽 표시", meaning: "선, 점, 기호", role: "지도 안의 길과 위치 표시" }
        ]
      }
    ],
    pronunciationNote: "음식 치즈 チーズ는 길게, 지도 ちず는 짧게 읽습니다.",
    exampleJa: "地図を見ます。",
    exampleReading: "ちずを みます。",
    exampleKo: "지도를 봅니다.",
    source: "jlpt",
    jlptLevel: "N5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    review: makeReview()
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
      {
        kanji: "都",
        koreanSound: "도",
        meaning: "큰 도시",
        easyStory: "사람들이 모여 사는 큰 고을이 都입니다.",
        meaningFlow: "마을을 나타내는 阝와 사람이 모인 느낌이 합쳐져 큰 도시의 느낌을 만듭니다.",
        components: [
          { shape: "者", name: "놈 자", meaning: "사람, 무리", role: "사람들이 모인 느낌" },
          { shape: "阝", name: "고을 읍", meaning: "마을, 지역", role: "도시와 장소의 의미" }
        ]
      },
      {
        kanji: "会",
        koreanSound: "회",
        meaning: "모임",
        easyStory: "사람들이 한곳에 모여 만나는 모습입니다.",
        meaningFlow: "사람이 모여 이야기하고 만나는 장면에서 모임, 회합의 뜻이 생깁니다.",
        components: [
          { shape: "人", name: "사람 인", meaning: "사람", role: "모이는 주체" },
          { shape: "云", name: "이를 운", meaning: "말하다/모이다", role: "사람들이 모여 말하는 분위기" }
        ]
      }
    ],
    pronunciationNote: "とかい 한 덩어리로 토카이라고 기억하세요.",
    exampleJa: "東京は都会です。",
    exampleReading: "とうきょうは とかいです。",
    exampleKo: "도쿄는 도시입니다.",
    source: "jlpt",
    jlptLevel: "N4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    review: makeReview()
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
      {
        kanji: "時",
        koreanSound: "시",
        meaning: "시간",
        easyStory: "해(日)가 움직이고 하루가 지나가면 시간이 됩니다.",
        meaningFlow: "日가 들어가서 해와 날의 흐름, 즉 시간과 관련된 뜻을 만듭니다.",
        components: [
          { shape: "日", name: "해 일", meaning: "해, 날", role: "시간 흐름의 핵심 이미지" },
          { shape: "寺", name: "절 사", meaning: "소리 보조", role: "じ/시 계열 소리와 형태를 보탬" }
        ]
      },
      {
        kanji: "代",
        koreanSound: "대",
        meaning: "세대, 시기",
        easyStory: "사람이 바뀌고 세대가 이어지는 차례입니다.",
        meaningFlow: "사람을 나타내는 亻와 바뀌는 느낌이 합쳐져 세대, 대신함, 시대의 뜻을 만듭니다.",
        components: [
          { shape: "亻", name: "사람 인 변", meaning: "사람", role: "세대를 이루는 사람" },
          { shape: "弋", name: "주살 익", meaning: "도구/표식", role: "바뀌거나 이어지는 느낌을 보탬" }
        ]
      }
    ],
    pronunciationNote: "じだい를 지다이 한 덩어리로 읽습니다.",
    exampleJa: "今はAIの時代です。",
    exampleReading: "いまは AI の じだいです。",
    exampleKo: "지금은 AI의 시대입니다.",
    source: "jlpt",
    jlptLevel: "N4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    review: makeReview()
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
      {
        kanji: "暑",
        koreanSound: "서",
        meaning: "덥다",
        easyStory: "해(日)가 사람 위에 강하게 내리쬐는 더운 날입니다.",
        meaningFlow: "日가 들어가서 햇빛과 더위의 느낌을 만들고, 아래쪽 구성은 소리와 형태를 보탭니다.",
        components: [
          { shape: "日", name: "해 일", meaning: "해, 햇빛", role: "더위의 원인" },
          { shape: "者", name: "놈 자", meaning: "사람/소리 보조", role: "더위를 받는 대상과 소리 보조" }
        ]
      }
    ],
    pronunciationNote: "끝의 い는 형용사 꼬리라 따로 외우지 않아도 됩니다.",
    exampleJa: "今日は暑いです。",
    exampleReading: "きょうは あついです。",
    exampleKo: "오늘은 덥습니다.",
    source: "jlpt",
    jlptLevel: "N5",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    review: makeReview()
  }
];

export function makeReview() {
  return {
    status: "new" as const,
    intervalDays: 0,
    lastReviewedAt: null,
    nextReviewAt: new Date().toISOString(),
    remembered: 0,
    confused: 0
  };
}

export function withReviewDefaults(card: WordCard): WordCard {
  return {
    ...card,
    review: {
      ...makeReview(),
      ...card.review
    }
  };
}
