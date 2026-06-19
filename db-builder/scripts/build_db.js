#!/usr/bin/env node
// JSONL raw 파일 → 레벨별 JSON DB 파일로 변환
const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../data/output');
const DATA_DIR = path.join(__dirname, '../data');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const levels = ['n5', 'n4', 'n3'];
const CSV_MAP = { n5: 'vocab_list.csv', n4: 'vocab_n4.csv', n3: 'vocab_n3.csv' };

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

function cardKey(card) {
  return `${String(card.expression || '').trim()}|${String(card.reading || '').trim()}`;
}

function loadAllowedKeys(level) {
  const csvFile = path.join(DATA_DIR, CSV_MAP[level]);
  if (!fs.existsSync(csvFile)) return null;
  const lines = fs.readFileSync(csvFile, 'utf8').split('\n').filter(Boolean);
  const keys = new Set();
  for (const line of lines.slice(1)) {
    const [expression, reading] = parseCsvLine(line);
    keys.add(`${String(expression || '').trim()}|${String(reading || '').trim()}`);
  }
  return keys;
}

for (const level of levels) {
  const rawFiles = fs.existsSync(RAW_DIR)
    ? fs.readdirSync(RAW_DIR)
      .filter(name => name.startsWith(`${level}_raw`) && name.endsWith('.jsonl'))
      .sort()
      .map(name => path.join(RAW_DIR, name))
    : [];

  if (!rawFiles.length) {
    console.log(`스킵: ${level} raw 파일 없음`);
    continue;
  }

  const lines = rawFiles.flatMap(rawFile =>
    fs.readFileSync(rawFile, 'utf8')
      .split('\n')
      .filter(l => l.trim())
  );

  const cardsByKey = new Map();
  const allowedKeys = loadAllowedKeys(level);

  for (const line of lines) {
    try {
      const card = JSON.parse(line);
      const key = cardKey(card);
      if (allowedKeys && !allowedKeys.has(key)) continue;
      cardsByKey.set(key, card);
    } catch (e) {
      console.warn(`파싱 실패: ${line.slice(0, 50)}`);
    }
  }

  const cards = Array.from(cardsByKey.values());
  const outputFile = path.join(OUTPUT_DIR, `jlpt-${level}-cards.json`);
  fs.writeFileSync(outputFile, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`${level.toUpperCase()}: ${cards.length}개 카드 → ${outputFile}`);
}

console.log('완료!');
