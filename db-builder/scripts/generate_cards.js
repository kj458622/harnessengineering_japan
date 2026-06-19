#!/usr/bin/env node
/**
 * JLPT 카드 DB 생성기
 * 사용법:
 *   node generate_cards.js n5              (전체, 단일 파일)
 *   node generate_cards.js n5 1 82 1       (배치1: 1~82번째, 별도 파일)
 *   node generate_cards.js n5 83 164 2     (배치2: 83~164번째, 별도 파일)
 * 마지막 인자가 배치 번호 — 있으면 n5_raw_1.jsonl 처럼 별도 파일에 씀
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [, , level = 'n5', startArg = '1', endArg = '99999', batchArg = ''] = process.argv;
const START = parseInt(startArg, 10);
const END = parseInt(endArg, 10);
const BATCH = batchArg ? `_${batchArg}` : '';

const BASE = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE, 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROMPT_TEMPLATE = path.join(__dirname, 'prompt_template.txt');

fs.mkdirSync(RAW_DIR, { recursive: true });

const CSV_MAP = { n5: 'vocab_list.csv', n4: 'vocab_n4.csv', n3: 'vocab_n3.csv' };
if (!CSV_MAP[level]) {
  console.error('레벨은 n5, n4, n3 중 하나를 입력하세요.');
  process.exit(1);
}

const csvPath = path.join(DATA_DIR, CSV_MAP[level]);
const outputPath = path.join(RAW_DIR, `${level}_raw${BATCH}.jsonl`);
const progressPath = path.join(RAW_DIR, `${level}_progress${BATCH}.txt`);

// 이미 완료된 ID 목록 로드
const doneSet = new Set(
  fs.existsSync(progressPath)
    ? fs.readFileSync(progressPath, 'utf8').split('\n').filter(Boolean)
    : []
);

// CSV 파싱
const csvLines = fs.readFileSync(csvPath, 'utf8').split('\n');
const template = fs.readFileSync(PROMPT_TEMPLATE, 'utf8');

// Claude 바이너리 탐색
const CLAUDE_CANDIDATES = [
  process.env.CLAUDE_BIN,
  '/home/seong/.vscode/extensions/anthropic.claude-code-2.1.168-linux-x64/resources/native-binary/claude',
  '/usr/local/bin/claude',
  'claude',
].filter(Boolean);

let CLAUDE_BIN = null;
for (const c of CLAUDE_CANDIDATES) {
  try {
    execSync(`"${c}" --version 2>/dev/null`, { stdio: 'pipe' });
    CLAUDE_BIN = c;
    break;
  } catch {}
}
if (!CLAUDE_BIN) {
  // 마지막 수단: PATH에서 찾기
  try {
    CLAUDE_BIN = execSync('which claude', { encoding: 'utf8' }).trim();
  } catch {
    console.error('ERROR: claude 바이너리를 찾을 수 없습니다.');
    console.error('CLAUDE_BIN 환경변수로 경로를 지정하세요.');
    process.exit(1);
  }
}
console.log(`Claude 바이너리: ${CLAUDE_BIN}`);

let processed = 0, skipped = 0, errors = 0;
let consecutiveErrors = 0;
console.log(`=== ${level.toUpperCase()} 카드 생성 시작 (${START}~${END}번째) ===`);

function runClaude(prompt, expression) {
  const tmpPrompt = path.join(RAW_DIR, `_tmp_prompt_${level}${BATCH}_${process.pid}.txt`);
  fs.writeFileSync(tmpPrompt, prompt, 'utf8');
  const maxAttempts = 3;
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return execSync(
          `"${CLAUDE_BIN}" -p "$(cat '${tmpPrompt}')" --output-format text`,
          { encoding: 'utf8', timeout: 120000, shell: '/bin/bash' }
        );
      } catch (e) {
        console.error(`    WARN: Claude 실행 실패 ${attempt}/${maxAttempts} - ${expression}`);
        console.error(`    ${e.message}`);
        if (attempt < maxAttempts) {
          execSync(`sleep ${attempt * 5}`);
        }
      }
    }
  } finally {
    if (fs.existsSync(tmpPrompt)) fs.unlinkSync(tmpPrompt);
  }
  throw new Error(`Claude 실행 실패 - ${expression}`);
}

for (let i = 1; i < csvLines.length; i++) {
  const line = csvLines[i].trim();
  if (!line) continue;

  const rowNum = i; // 1-indexed (헤더 제외)
  if (rowNum < START || rowNum > END) continue;

  const parts = line.split(',');
  if (parts.length < 6) continue;

  const [expression, reading, romaji, meaningKo, partOfSpeech, lvl] = parts;
  const cardId = `${lvl}_${crypto.createHash('md5').update(`${expression}|${reading}`).digest('hex').slice(0, 8)}`;

  if (doneSet.has(cardId)) {
    console.log(`  스킵 [${rowNum}]: ${expression}`);
    skipped++;
    continue;
  }

  console.log(`  처리중 [${rowNum}]: ${expression} (${reading}) - ${meaningKo}`);

  // 프롬프트 생성
  const prompt = template
    .replace('{{EXPRESSION}}', expression)
    .replace('{{READING}}', reading)
    .replace('{{ROMAJI}}', romaji)
    .replace('{{MEANING}}', meaningKo)
    .replace('{{POS}}', partOfSpeech)
    .replace('{{LEVEL}}', lvl);

  let result;
  try {
    result = runClaude(prompt, expression);
  } catch (e) {
    console.error(`    ERROR: Claude 실행 실패 - ${expression}`);
    console.error(`    ${e.message}`);
    errors++;
    consecutiveErrors++;
    if (consecutiveErrors >= 5) {
      console.error('    ERROR: 연속 실패 5회로 중단합니다. 같은 명령을 다시 실행하면 완료 항목은 스킵됩니다.');
      break;
    }
    continue;
  }

  // JSON 추출: { ... } 블록 찾기
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`    ERROR: JSON 파싱 실패 - ${expression}`);
    console.error(`    응답: ${result.slice(0, 100)}`);
    errors++;
    consecutiveErrors++;
    if (consecutiveErrors >= 5) {
      console.error('    ERROR: 연속 실패 5회로 중단합니다. 같은 명령을 다시 실행하면 완료 항목은 스킵됩니다.');
      break;
    }
    continue;
  }

  let ai;
  try {
    ai = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error(`    ERROR: JSON 파싱 오류 - ${expression}: ${e.message}`);
    errors++;
    consecutiveErrors++;
    if (consecutiveErrors >= 5) {
      console.error('    ERROR: 연속 실패 5회로 중단합니다. 같은 명령을 다시 실행하면 완료 항목은 스킵됩니다.');
      break;
    }
    continue;
  }

  const now = new Date().toISOString();
  const card = {
    id: cardId,
    expression,
    reading,
    romaji,
    meaningKo: ai.meaningKo || meaningKo,
    partOfSpeech: ai.partOfSpeech || partOfSpeech,
    jlptLevel: lvl.toUpperCase(),
    source: 'jlpt',
    soundKo: ai.soundKo || '',
    mnemonic: ai.mnemonic || '',
    easyExplanation: ai.easyExplanation || '',
    kanjiNotes: ai.kanjiNotes || [],
    pronunciationNote: ai.pronunciationNote || '',
    exampleJa: ai.exampleJa || '',
    exampleReading: ai.exampleReading || '',
    exampleKo: ai.exampleKo || '',
    createdAt: now,
    updatedAt: now,
    review: {
      status: 'new',
      intervalDays: 1,
      lastReviewedAt: null,
      nextReviewAt: now,
      remembered: 0,
      confused: 0,
    },
  };

  fs.appendFileSync(outputPath, JSON.stringify(card) + '\n', 'utf8');
  fs.appendFileSync(progressPath, cardId + '\n', 'utf8');
  doneSet.add(cardId);
  processed++;
  consecutiveErrors = 0;
  console.log(`    완료: ${expression} → soundKo: ${ai.soundKo}`);

  // sleep 1초 (API 부하 방지)
  execSync('sleep 1');
}

console.log('');
console.log('=== 완료 ===');
console.log(`처리: ${processed}개`);
console.log(`스킵: ${skipped}개 (이미 완료)`);
console.log(`오류: ${errors}개`);
console.log(`출력: ${outputPath}`);
