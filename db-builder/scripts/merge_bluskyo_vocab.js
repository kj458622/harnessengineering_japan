#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..');
const SOURCE = path.join(BASE, 'data/source/bluskyo_jlpt_vocab_all.csv');
const TARGETS = {
  4: path.join(BASE, 'data/vocab_n4.csv'),
  3: path.join(BASE, 'data/vocab_n3.csv')
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
      const next = KANA_ROMAJI.find(([kana]) => text.slice(i + 1).startsWith(kana));
      if (next) out += next[1][0];
      continue;
    }
    const pair = KANA_ROMAJI.find(([kana]) => text.slice(i).startsWith(kana));
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
  const lines = fs.readFileSync(file, 'utf8').trimEnd().split(/\r?\n/);
  const seen = new Set();
  for (const line of lines.slice(1)) {
    const [expression, reading] = parseCsvLine(line);
    seen.add(key(expression, reading));
  }
  return { lines, seen };
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Missing source file: ${SOURCE}`);
  process.exit(1);
}

const sourceRows = fs.readFileSync(SOURCE, 'utf8').trimEnd().split(/\r?\n/).slice(1);
const additionsByLevel = { 4: [], 3: [] };

for (const line of sourceRows) {
  const [expression, reading, level] = parseCsvLine(line);
  if (!TARGETS[level] || !expression || !reading) continue;
  additionsByLevel[level].push({ expression, reading });
}

for (const [level, file] of Object.entries(TARGETS)) {
  const { lines, seen } = loadExisting(file);
  const additions = [];
  for (const row of additionsByLevel[level]) {
    const rowKey = key(row.expression, row.reading);
    if (seen.has(rowKey)) continue;
    seen.add(rowKey);
    additions.push([
      row.expression,
      row.reading,
      toRomaji(row.reading),
      '뜻 자동 생성 필요',
      '미분류',
      `N${level}`
    ]);
  }

  if (additions.length) {
    const appended = additions.map(row => row.map(csvEscape).join(','));
    fs.writeFileSync(file, `${lines.concat(appended).join('\n')}\n`, 'utf8');
  }

  console.log(`N${level}: ${additions.length}개 추가`);
}
