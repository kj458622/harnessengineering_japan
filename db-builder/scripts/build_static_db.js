#!/usr/bin/env node
// CSV 단어 목록만으로 API 없는 1단계 검색용 카드 DB를 생성한다.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const OUTPUT_DIR = path.join(DATA_DIR, 'output');
const CSV_MAP = {
  n5: 'vocab_list.csv',
  n4: 'vocab_n4.csv',
  n3: 'vocab_n3.csv'
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function isMeaningPlaceholder(value) {
  return !value || value === '뜻 자동 생성 필요' || value === '뜻 확인 필요';
}

function isPartOfSpeechPlaceholder(value) {
  return !value || value === '미분류' || value === '직접 확인';
}

function makeCardId(level, expression, reading) {
  const hash = crypto.createHash('md5').update(`${expression}|${reading}`).digest('hex').slice(0, 8);
  return `${level.toUpperCase()}_${hash}`;
}

function makeReview(now) {
  return {
    status: 'new',
    intervalDays: 1,
    lastReviewedAt: null,
    nextReviewAt: now,
    remembered: 0,
    confused: 0
  };
}

function makeStaticCard(row, level) {
  const [expression, reading, romaji, rawMeaningKo, rawPartOfSpeech, rawLevel] = row;
  const jlptLevel = (rawLevel || level).toUpperCase();
  const meaningMissing = isMeaningPlaceholder(rawMeaningKo);
  const posMissing = isPartOfSpeechPlaceholder(rawPartOfSpeech);
  const meaningKo = meaningMissing ? '뜻 확인 필요' : rawMeaningKo;
  const partOfSpeech = posMissing ? '미분류' : rawPartOfSpeech;
  const now = new Date().toISOString();

  return {
    id: makeCardId(jlptLevel, expression, reading),
    expression,
    reading,
    romaji,
    meaningKo,
    partOfSpeech,
    soundKo: reading,
    mnemonic: meaningMissing
      ? '아직 암기문이 생성되지 않았습니다. 뜻을 확인한 뒤 암기문을 추가하세요.'
      : `${reading}의 소리와 '${meaningKo}' 뜻을 연결해 암기문을 추가하세요.`,
    easyExplanation: meaningMissing
      ? '1단계 검색용 카드입니다. 일본어 표현과 읽기만 먼저 저장되어 있습니다.'
      : `${expression}는 한국어로 '${meaningKo}'라는 뜻입니다.`,
    kanjiNotes: [],
    pronunciationNote: 'AI 분석 전 1단계 카드입니다. 읽기를 기준으로 발음을 확인하세요.',
    exampleJa: '',
    exampleReading: '',
    exampleKo: '',
    source: 'jlpt',
    jlptLevel,
    qualityStatus: meaningMissing || posMissing ? 'needs_enrichment' : 'static',
    createdAt: now,
    updatedAt: now,
    review: makeReview(now)
  };
}

const allCards = [];

for (const [level, csvName] of Object.entries(CSV_MAP)) {
  const csvFile = path.join(DATA_DIR, csvName);
  const lines = fs.readFileSync(csvFile, 'utf8').split('\n').filter(Boolean);
  const seen = new Set();
  const cards = [];

  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line);
    if (row.length < 6) continue;

    const [expression, reading] = row;
    const key = `${expression}|${reading}`;
    if (!expression || !reading || seen.has(key)) continue;

    seen.add(key);
    cards.push(makeStaticCard(row, level));
  }

  const outputFile = path.join(OUTPUT_DIR, `jlpt-${level}-cards.json`);
  fs.writeFileSync(outputFile, JSON.stringify(cards, null, 2), 'utf8');
  allCards.push(...cards);
  console.log(`${level.toUpperCase()}: ${cards.length}개 static 카드 → ${outputFile}`);
}

const indexFile = path.join(OUTPUT_DIR, 'jlpt-all-cards-index.json');
fs.writeFileSync(indexFile, JSON.stringify(allCards, null, 2), 'utf8');
console.log(`ALL: ${allCards.length}개 static 카드 → ${indexFile}`);
