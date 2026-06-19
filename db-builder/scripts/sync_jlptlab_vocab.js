#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const path = require('path');

const BASE = path.join(__dirname, '..');
const SOURCE_DIR = path.join(BASE, 'data/source');
const TARGETS = {
  N4: {
    pages: 27,
    file: path.join(BASE, 'data/vocab_n4.csv'),
    expected: 566,
    maxPasses: 6
  },
  N3: {
    pages: 80,
    file: path.join(BASE, 'data/vocab_n3.csv'),
    expected: 1669,
    maxPasses: 6
  }
};

const KANA_ROMAJI = [
  ['きゃ', 'kya'], ['きゅ', 'kyu'], ['きょ', 'kyo'],
  ['しゃ', 'sha'], ['しゅ', 'shu'], ['しょ', 'sho'],
  ['ちゃ', 'cha'], ['ちゅ', 'chu'], ['ちょ', 'cho'],
  ['にゃ', 'nya'], ['にゅ', 'nyu'], ['にょ', 'nyo'],
  ['ひゃ', 'hya'], ['ひゅ', 'hyu'], ['ひょ', 'hyo'],
  ['みゃ', 'mya'], ['みゅ', 'myu'], ['みょ', 'myo'],
  ['りゃ', 'rya'], ['りゅ', 'ryu'], ['りょ', 'ryo'],
  ['ぎゃ', 'gya'], ['ぎゅ', 'gyu'], ['ぎょ', 'gyo'],
  ['じゃ', 'ja'], ['じゅ', 'ju'], ['じょ', 'jo'],
  ['びゃ', 'bya'], ['びゅ', 'byu'], ['びょ', 'byo'],
  ['ぴゃ', 'pya'], ['ぴゅ', 'pyu'], ['ぴょ', 'pyo'],
  ['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
  ['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
  ['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
  ['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
  ['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
  ['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
  ['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
  ['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
  ['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
  ['わ', 'wa'], ['を', 'wo'], ['ん', 'n'],
  ['が', 'ga'], ['ぎ', 'gi'], ['ぐ', 'gu'], ['げ', 'ge'], ['ご', 'go'],
  ['ざ', 'za'], ['じ', 'ji'], ['ず', 'zu'], ['ぜ', 'ze'], ['ぞ', 'zo'],
  ['だ', 'da'], ['ぢ', 'ji'], ['づ', 'zu'], ['で', 'de'], ['ど', 'do'],
  ['ば', 'ba'], ['び', 'bi'], ['ぶ', 'bu'], ['べ', 'be'], ['ぼ', 'bo'],
  ['ぱ', 'pa'], ['ぴ', 'pi'], ['ぷ', 'pu'], ['ぺ', 'pe'], ['ぽ', 'po'],
  ['ぁ', 'a'], ['ぃ', 'i'], ['ぅ', 'u'], ['ぇ', 'e'], ['ぉ', 'o'],
  ['ゃ', 'ya'], ['ゅ', 'yu'], ['ょ', 'yo'],
  ['ー', '-']
];

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'harnessengineering-japan-db-builder/1.0' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(request(res.headers.location));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

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

function csvEscape(value) {
  const s = String(value == null ? '' : value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toRomaji(reading) {
  let text = reading.replace(/[ァ-ン]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === 'っ') {
      const next = KANA_ROMAJI.find(pair => text.slice(i + 1).indexOf(pair[0]) === 0);
      if (next) out += next[1][0];
      continue;
    }
    const pair = KANA_ROMAJI.find(pair => text.slice(i).indexOf(pair[0]) === 0);
    if (pair) {
      out += pair[1];
      i += pair[0].length - 1;
    } else {
      out += ch;
    }
  }
  return out.replace(/-/g, '');
}

function key(expression, reading) {
  return `${expression.trim()}|${reading.trim()}`;
}

function loadExisting(file) {
  const rows = new Map();
  if (!fs.existsSync(file)) return rows;
  const lines = fs.readFileSync(file, 'utf8').trimEnd().split(/\r?\n/);
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const parts = parseCsvLine(line);
    rows.set(key(parts[0], parts[1]), {
      expression: parts[0],
      reading: parts[1],
      romaji: parts[2],
      meaningKo: parts[3],
      partOfSpeech: parts[4],
      level: parts[5]
    });
  }
  return rows;
}

function extractEntries(html, level) {
  const entries = [];
  const re = /href="https:\/\/jlptlab\.com\/vocabularies\/([^"]+)"/g;
  let match;
  while ((match = re.exec(html))) {
    const slug = decodeURIComponent(match[1]);
    const pivot = slug.lastIndexOf('-');
    if (pivot < 1) continue;
    const expression = slug.slice(0, pivot);
    const reading = slug.slice(pivot + 1);
    if (!expression || !reading) continue;
    entries.push({ expression, reading, level });
  }
  return entries;
}

async function fetchLevel(level, pages, expected, maxPasses, existingEntries) {
  const seen = new Set();
  const entries = [];

  for (const entry of existingEntries) {
    const entryKey = key(entry.expression, entry.reading);
    seen.add(entryKey);
    entries.push(entry);
  }

  for (let pass = 1; pass <= maxPasses && entries.length < expected; pass++) {
    const before = entries.length;
    for (let page = 1; page <= pages; page++) {
      const url = `https://jlptlab.com/vocabularies?level=${level}&page=${page}&scan=${Date.now()}-${pass}`;
      const html = await request(url);
      for (const entry of extractEntries(html, level)) {
        const entryKey = key(entry.expression, entry.reading);
        if (seen.has(entryKey)) continue;
        seen.add(entryKey);
        entries.push(entry);
      }
      console.log(`${level} pass ${pass}/${maxPasses} page ${page}/${pages}: ${entries.length}`);
    }
    if (entries.length === before) {
      break;
    }
  }
  return entries;
}

function writeCsv(file, rows) {
  const lines = ['expression,reading,romaji,meaningKo,partOfSpeech,level'];
  for (const row of rows) {
    lines.push([
      row.expression,
      row.reading,
      row.romaji,
      row.meaningKo,
      row.partOfSpeech,
      row.level
    ].map(csvEscape).join(','));
  }
  fs.writeFileSync(file, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });

  for (const level of Object.keys(TARGETS)) {
    const target = TARGETS[level];
    const existing = loadExisting(target.file);
    const existingEntries = Array.from(existing.values()).map(row => ({
      expression: row.expression,
      reading: row.reading,
      level
    }));
    const fetched = await fetchLevel(level, target.pages, target.expected, target.maxPasses, existingEntries);
    const rows = fetched.map(entry => {
      const current = existing.get(key(entry.expression, entry.reading));
      return {
        expression: entry.expression,
        reading: entry.reading,
        romaji: current && current.romaji ? current.romaji : toRomaji(entry.reading),
        meaningKo: current && current.meaningKo ? current.meaningKo : '뜻 자동 생성 필요',
        partOfSpeech: current && current.partOfSpeech ? current.partOfSpeech : '미분류',
        level
      };
    });

    const sourceFile = path.join(SOURCE_DIR, `jlptlab_${level.toLowerCase()}_words.csv`);
    writeCsv(sourceFile, rows.map(row => ({
      expression: row.expression,
      reading: row.reading,
      romaji: row.romaji,
      meaningKo: '뜻 자동 생성 필요',
      partOfSpeech: '미분류',
      level: row.level
    })));
    writeCsv(target.file, rows);

    const warning = rows.length === target.expected ? '' : ` (expected ${target.expected})`;
    console.log(`${level}: wrote ${rows.length}${warning}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
