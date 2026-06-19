#!/usr/bin/env node
/**
 * 로컬 Next API를 이용해 "뜻 확인 필요" 또는 1단계 static 카드를 순차 보강한다.
 *
 * 사용 예:
 *   node db-builder/scripts/enrich_cards_via_local_api.js n4 20
 *   node db-builder/scripts/enrich_cards_via_local_api.js n3 all
 *   API_URL=http://127.0.0.1:4320/api/generate-card node db-builder/scripts/enrich_cards_via_local_api.js all 100
 *
 * 전제:
 *   1. openai-oauth 또는 OPENAI_API_KEY 설정이 정상이어야 한다.
 *   2. memory-next-app 개발 서버가 4320 포트에서 실행 중이어야 한다.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(ROOT, 'db-builder/data/output');
const ALL_DB = path.join(OUTPUT_DIR, 'jlpt-all-cards-index.json');
const API_URL = process.env.API_URL || 'http://127.0.0.1:4320/api/generate-card';
const LEVEL_ARG = String(process.argv[2] || 'all').toUpperCase();
const LIMIT_ARG = process.argv[3] || '20';
const parsedLimit = parseInt(LIMIT_ARG, 10);
const LIMIT = LIMIT_ARG === 'all' ? Infinity : Math.max(0, Number.isFinite(parsedLimit) ? parsedLimit : 20);
const DELAY_MS = Math.max(0, parseInt(process.env.DELAY_MS || '1200', 10) || 0);
const RETRY_COUNT = Math.max(0, parseInt(process.env.RETRY_COUNT || '2', 10) || 0);
const STOP_AFTER_INFRA_ERRORS = Math.max(1, parseInt(process.env.STOP_AFTER_INFRA_ERRORS || '5', 10) || 5);
const PROGRESS_FILE = path.join(ROOT, 'db-builder/data/output/enrich-progress.json');

const SYNC_TARGETS = [
  path.join(ROOT, 'memory-app/data'),
  path.join(ROOT, 'memory-next-app/public/data'),
  path.join(ROOT, 'nextjs-memory-app/public/data')
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}

function needsEnrichment(card) {
  return (
    card.meaningKo === '뜻 확인 필요' ||
    card.partOfSpeech === '미분류' ||
    card.qualityStatus === 'needs_enrichment' ||
    card.pronunciationNote === 'AI 분석 전 1단계 카드입니다. 읽기를 기준으로 발음을 확인하세요.' ||
    !card.exampleJa ||
    !card.exampleKo ||
    !Array.isArray(card.kanjiNotes) ||
    !card.kanjiNotes.length
  );
}

function mergeCard(base, generated) {
  const now = new Date().toISOString();
  return {
    ...base,
    ...generated,
    id: base.id,
    createdAt: base.createdAt || now,
    updatedAt: now,
    note: base.note || '',
    review: base.review,
    jlptLevel: base.jlptLevel,
    source: generated.source || 'ai',
    qualityStatus: 'ai_enriched',
    kanjiNotes: Array.isArray(generated.kanjiNotes) ? generated.kanjiNotes : []
  };
}

function postJson(urlString, body) {
  const url = new URL(urlString);
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port || 80,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 120000
      },
      res => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
            return;
          }

          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (error) {
            reject(new Error(`JSON 파싱 실패: ${data.slice(0, 300)}`));
            return;
          }

          resolve(parsed);
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('API 요청 시간 초과'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function isInfrastructureError(error) {
  const message = String(error && error.message ? error.message : error);
  return (
    message.includes('HTTP 500') ||
    message.includes('Internal Server Error') ||
    message.includes('<!DOCTYPE html>') ||
    message.includes('JSON 파싱 실패') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ECONNRESET') ||
    message.includes('ETIMEDOUT') ||
    message.includes('API 요청 시간 초과') ||
    message.includes('fetch failed')
  );
}

async function analyzeCardViaApi(card) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_COUNT; attempt++) {
    try {
      return await postJson(API_URL, { query: card.expression });
    } catch (error) {
      lastError = error;
      if (attempt < RETRY_COUNT) {
        const waitMs = 2500 * (attempt + 1);
        console.error(`  WARN: API 실패, ${waitMs}ms 뒤 재시도 ${attempt + 1}/${RETRY_COUNT}: ${error.message}`);
        await sleep(waitMs);
      }
    }
  }

  throw lastError;
}

function saveAllCopies(cards) {
  writeJson(ALL_DB, cards);

  for (const level of ['N5', 'N4', 'N3']) {
    writeJson(path.join(OUTPUT_DIR, `jlpt-${level.toLowerCase()}-cards.json`), cards.filter(card => card.jlptLevel === level));
  }

  for (const dir of SYNC_TARGETS) {
    writeJson(path.join(dir, 'jlpt-all-cards-index.json'), cards);
    for (const level of ['N5', 'N4', 'N3']) {
      writeJson(path.join(dir, `jlpt-${level.toLowerCase()}-cards.json`), cards.filter(card => card.jlptLevel === level));
    }
  }
}

async function main() {
  const cards = readJson(ALL_DB, []);
  const progress = readJson(PROGRESS_FILE, { done: {}, failed: {} });
  const candidates = cards.filter(card => {
    if (LEVEL_ARG !== 'ALL' && card.jlptLevel !== LEVEL_ARG) return false;
    if (progress.done[card.id]) return false;
    return needsEnrichment(card);
  });

  console.log(`API: ${API_URL}`);
  console.log(`대상 레벨: ${LEVEL_ARG}`);
  console.log(`보강 필요: ${candidates.length}개, 이번 실행 한도: ${Number.isFinite(LIMIT) ? LIMIT : 'all'}개`);

  let success = 0;
  let failed = 0;
  let consecutiveInfraErrors = 0;

  for (const card of candidates.slice(0, LIMIT)) {
    const label = `${card.jlptLevel} ${card.expression} (${card.reading})`;
    console.log(`분석 중: ${label}`);

    try {
      const result = await analyzeCardViaApi(card);
      if (!result.card || !['ai', 'oauth'].includes(result.mode)) {
        throw new Error(`AI/OAuth 결과가 아님: mode=${result.mode || 'unknown'}`);
      }

      const index = cards.findIndex(item => item.id === card.id);
      cards[index] = mergeCard(card, result.card);
      progress.done[card.id] = new Date().toISOString();
      delete progress.failed[card.id];
      success++;
      consecutiveInfraErrors = 0;

      saveAllCopies(cards);
      writeJson(PROGRESS_FILE, progress);
      console.log(`  OK: ${cards[index].meaningKo}`);
    } catch (error) {
      progress.failed[card.id] = { at: new Date().toISOString(), message: error.message };
      writeJson(PROGRESS_FILE, progress);
      failed++;
      console.error(`  FAIL: ${error.message}`);

      if (isInfrastructureError(error)) {
        consecutiveInfraErrors++;
        if (consecutiveInfraErrors >= STOP_AFTER_INFRA_ERRORS) {
          console.error(`연속 서버/API 오류 ${consecutiveInfraErrors}회로 중단합니다. openai-oauth와 next dev 상태를 확인한 뒤 같은 명령을 다시 실행하세요.`);
          break;
        }
      } else {
        consecutiveInfraErrors = 0;
      }
    }

    if (DELAY_MS) await sleep(DELAY_MS);
  }

  console.log(`완료: 성공 ${success}개, 실패 ${failed}개`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
