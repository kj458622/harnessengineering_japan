#!/usr/bin/env node
/**
 * OpenAI API 기반 JLPT 카드 DB 생성기
 *
 * 사용법:
 *   OPENAI_API_KEY=... node scripts/generate_cards_openai.js n4
 *   OPENAI_API_KEY=... node scripts/generate_cards_openai.js n3
 *   OPENAI_MODEL=gpt-5.2 OPENAI_API_KEY=... node scripts/generate_cards_openai.js n3 1 20
 */

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');

const [, , level = 'n5', startArg = '1', endArg = '99999', batchArg = 'openai'] = process.argv;
const START = parseInt(startArg, 10);
const END = parseInt(endArg, 10);
const BATCH = batchArg ? `_${batchArg}` : '_openai';

const BASE = path.join(__dirname, '..');
const DATA_DIR = path.join(BASE, 'data');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROMPT_TEMPLATE = path.join(__dirname, 'prompt_template.txt');
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.2';
const API_KEY = process.env.OPENAI_API_KEY;

fs.mkdirSync(RAW_DIR, { recursive: true });

const CSV_MAP = { n5: 'vocab_list.csv', n4: 'vocab_n4.csv', n3: 'vocab_n3.csv' };
if (!CSV_MAP[level]) {
  console.error('레벨은 n5, n4, n3 중 하나를 입력하세요.');
  process.exit(1);
}

if (!API_KEY) {
  console.error('ERROR: OPENAI_API_KEY 환경변수가 필요합니다.');
  process.exit(1);
}

const csvPath = path.join(DATA_DIR, CSV_MAP[level]);
const outputPath = path.join(RAW_DIR, `${level}_raw${BATCH}.jsonl`);
const progressPath = path.join(RAW_DIR, `${level}_progress${BATCH}.txt`);
const csvLines = fs.readFileSync(csvPath, 'utf8').split('\n');
const template = fs.readFileSync(PROMPT_TEMPLATE, 'utf8');

const doneSet = new Set(
  fs.existsSync(progressPath)
    ? fs.readFileSync(progressPath, 'utf8').split('\n').filter(Boolean)
    : []
);

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractOutputText(payload) {
  if (payload.output_text) return payload.output_text;
  if (!Array.isArray(payload.output)) return '';
  return payload.output
    .flatMap(item => Array.isArray(item.content) ? item.content : [])
    .map(content => content.text || '')
    .filter(Boolean)
    .join('\n');
}

function callOpenAI(prompt) {
  const body = JSON.stringify({
    model: MODEL,
    input: prompt,
    max_output_tokens: 1800
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/responses',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`OpenAI HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
          return;
        }
        try {
          resolve(extractOutputText(JSON.parse(data)));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runOpenAI(prompt, expression) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await callOpenAI(prompt);
    } catch (error) {
      console.error(`    WARN: OpenAI 실행 실패 ${attempt}/${maxAttempts} - ${expression}`);
      console.error(`    ${error.message}`);
      if (attempt < maxAttempts) {
        await sleep(attempt * 5000);
      }
    }
  }
  throw new Error(`OpenAI 실행 실패 - ${expression}`);
}

async function main() {
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  let consecutiveErrors = 0;

  console.log(`OpenAI 모델: ${MODEL}`);
  console.log(`=== ${level.toUpperCase()} OpenAI 카드 생성 시작 (${START}~${END}번째) ===`);

  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i].trim();
    if (!line) continue;

    const rowNum = i;
    if (rowNum < START || rowNum > END) continue;

    const parts = parseCsvLine(line);
    if (parts.length < 6) continue;

    const [expression, reading, romaji, meaningKo, partOfSpeech, lvl] = parts;
    const cardId = `${lvl}_${crypto.createHash('md5').update(`${expression}|${reading}`).digest('hex').slice(0, 8)}`;

    if (doneSet.has(cardId)) {
      console.log(`  스킵 [${rowNum}]: ${expression}`);
      skipped++;
      continue;
    }

    console.log(`  처리중 [${rowNum}]: ${expression} (${reading}) - ${meaningKo}`);

    const prompt = template
      .replace('{{EXPRESSION}}', expression)
      .replace('{{READING}}', reading)
      .replace('{{ROMAJI}}', romaji)
      .replace('{{MEANING}}', meaningKo)
      .replace('{{POS}}', partOfSpeech)
      .replace('{{LEVEL}}', lvl);

    let result;
    try {
      result = await runOpenAI(prompt, expression);
    } catch (error) {
      console.error(`    ERROR: OpenAI 실행 실패 - ${expression}`);
      console.error(`    ${error.message}`);
      errors++;
      consecutiveErrors++;
      if (consecutiveErrors >= 5) {
        console.error('    ERROR: 연속 실패 5회로 중단합니다. 같은 명령을 다시 실행하면 완료 항목은 스킵됩니다.');
        break;
      }
      continue;
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`    ERROR: JSON 파싱 실패 - ${expression}`);
      console.error(`    응답: ${result.slice(0, 200)}`);
      errors++;
      consecutiveErrors++;
      if (consecutiveErrors >= 5) break;
      continue;
    }

    let ai;
    try {
      ai = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`    ERROR: JSON 파싱 오류 - ${expression}: ${error.message}`);
      errors++;
      consecutiveErrors++;
      if (consecutiveErrors >= 5) break;
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
        confused: 0
      }
    };

    fs.appendFileSync(outputPath, JSON.stringify(card) + '\n', 'utf8');
    fs.appendFileSync(progressPath, cardId + '\n', 'utf8');
    doneSet.add(cardId);
    processed++;
    consecutiveErrors = 0;
    console.log(`    완료: ${expression} → soundKo: ${ai.soundKo}`);

    await sleep(500);
  }

  console.log('');
  console.log('=== 완료 ===');
  console.log(`처리: ${processed}개`);
  console.log(`스킵: ${skipped}개 (이미 완료)`);
  console.log(`오류: ${errors}개`);
  console.log(`출력: ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
