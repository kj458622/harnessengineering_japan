# JLPT 카드 DB 생성 에이전트

## 목적
N5/N4/N3 일본어 단어를 경선식 암기법 스타일의 학습 카드 JSON DB로 변환한다.

## 전체 파이프라인

```
data/vocab_list.csv  (N5)  ─┐
data/vocab_n4.csv    (N4)  ─┼─→ generate_cards.sh → data/raw/*.jsonl → build_db.js → data/output/*.json
data/vocab_n3.csv    (N3)  ─┘
```

## 파일 구조

```
db-builder/
  data/
    vocab_list.csv       ← N5 단어 목록 (~300개)
    vocab_n4.csv         ← N4 단어 목록 (~600개)
    vocab_n3.csv         ← N3 단어 목록 (~1500개)
    raw/
      n5_raw.jsonl       ← 생성된 N5 카드 (JSONL)
      n4_raw.jsonl       ← 생성된 N4 카드 (JSONL)
      n3_raw.jsonl       ← 생성된 N3 카드 (JSONL)
      *_progress.txt     ← 완료된 카드 ID 목록 (재시작 지원)
    output/
      jlpt-n5-cards.json ← 최종 N5 DB
      jlpt-n4-cards.json ← 최종 N4 DB
      jlpt-n3-cards.json ← 최종 N3 DB
  scripts/
    generate_cards.sh    ← Claude Code로 카드 생성
    build_db.js          ← JSONL → JSON 변환
    prompt_template.txt  ← 카드 생성 프롬프트
```

## 실행 방법 (Node.js 스크립트 기준 — 권장)

### 1. 전체 실행 순서
```bash
cd /home/seong/2026/harnessengineering_japan/db-builder

# N5 전체 생성 (~326개, 약 15~20분)
node scripts/generate_cards.js n5

# N4 전체 생성 (~414개, 약 20~30분)
node scripts/generate_cards.js n4

# N3 전체 생성 (~419개, 약 20~30분)
node scripts/generate_cards.js n3

# 최종 DB JSON 빌드
node scripts/build_db.js
```

### 2. 범위 지정 (테스트 / 재시작)
```bash
# N5 1~5번째만 테스트
node scripts/generate_cards.js n5 1 5

# N4 50번째부터 끝까지
node scripts/generate_cards.js n4 50

# N3 100~200번째만
node scripts/generate_cards.js n3 100 200
```

### 3. 중단 후 재시작
- 그냥 같은 명령어를 다시 실행하면 됨
- `data/raw/*_progress.txt`에 완료된 ID가 저장되어 자동 스킵

## 재시작 안전
- `data/raw/*_progress.txt`에 완료된 카드 ID가 저장됨
- 스크립트 재실행 시 이미 완료된 단어는 자동 스킵
- 중간에 끊겨도 이어서 실행 가능

## 출력 카드 형식 (WordCard)
```json
{
  "id": "n5_a1b2c3d4",
  "expression": "森",
  "reading": "もり",
  "romaji": "mori",
  "meaningKo": "숲",
  "partOfSpeech": "명사",
  "jlptLevel": "N5",
  "source": "jlpt",
  "soundKo": "모리",
  "mnemonic": "나무가 모리모리 모여 있는 곳이 숲.",
  "easyExplanation": "森는 나무가 아주 많이 모여 있는 숲이에요.",
  "kanjiNotes": [
    {
      "kanji": "森",
      "koreanSound": "삼",
      "meaning": "숲",
      "easyStory": "木가 세 개 모이면 나무가 빽빽한 숲이 됩니다."
    }
  ],
  "pronunciationNote": "",
  "exampleJa": "森に行きます。",
  "exampleReading": "もりに いきます。",
  "exampleKo": "숲에 갑니다.",
  "createdAt": "2026-06-08T00:00:00Z",
  "updatedAt": "2026-06-08T00:00:00Z",
  "review": {
    "status": "new",
    "intervalDays": 1,
    "lastReviewedAt": null,
    "nextReviewAt": "2026-06-08T00:00:00Z",
    "remembered": 0,
    "confused": 0
  }
}
```

## Codex 에이전트 실행 지시

Codex에서 이 파이프라인을 실행할 때:

1. `db-builder/` 디렉토리에서 작업
2. `scripts/generate_cards.sh n5`부터 순서대로 실행
3. 각 레벨 완료 후 `node scripts/build_db.js`로 DB 빌드
4. 생성된 `data/output/*.json` 파일을 앱의 `public/data/` 또는 `lib/data/`에 복사

## 주의사항
- Claude CLI 경로: `/home/seong/.vscode/extensions/anthropic.claude-code-2.1.168-linux-x64/resources/native-binary/claude`
- 다른 환경에서는 `CLAUDE_BIN` 환경변수로 경로 지정: `CLAUDE_BIN=/path/to/claude ./scripts/generate_cards.sh n5`
- 단어 1개당 약 2~5초 소요 (sleep 2 포함)
- N5 300개 ≈ 15~25분, N4 600개 ≈ 30~50분, N3 1500개 ≈ 75~125분
