#!/bin/bash
# JLPT 카드 DB 생성 스크립트
# 사용법: ./generate_cards.sh [n5|n4|n3] [시작줄] [끝줄]
# 예: ./generate_cards.sh n5
# 예: ./generate_cards.sh n4 10 50  (10~50번째 단어만 처리)

set -e

LEVEL=${1:-n5}
START=${2:-2}   # CSV 헤더 제외, 1-indexed
END=${3:-9999}

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"
RAW_DIR="$DATA_DIR/raw"
PROMPT_TEMPLATE="$SCRIPT_DIR/prompt_template.txt"

mkdir -p "$RAW_DIR"

case $LEVEL in
  n5) CSV="$DATA_DIR/vocab_list.csv" ;;
  n4) CSV="$DATA_DIR/vocab_n4.csv" ;;
  n3) CSV="$DATA_DIR/vocab_n3.csv" ;;
  *)  echo "레벨은 n5, n4, n3 중 하나를 입력하세요."; exit 1 ;;
esac

OUTPUT="$RAW_DIR/${LEVEL}_raw.jsonl"
PROGRESS="$RAW_DIR/${LEVEL}_progress.txt"

# 이미 처리된 단어 목록 로드
touch "$PROGRESS"
DONE_LIST=$(cat "$PROGRESS")

CLAUDE_BIN="${CLAUDE_BIN:-/home/seong/.vscode/extensions/anthropic.claude-code-2.1.168-linux-x64/resources/native-binary/claude}"

echo "=== $LEVEL 카드 생성 시작 ==="
echo "CSV: $CSV"
echo "출력: $OUTPUT"

LINE_NUM=1
PROCESSED=0
SKIPPED=0
ERRORS=0

while IFS=, read -r expression reading romaji meaningKo partOfSpeech level; do
  # 헤더 스킵
  if [ "$LINE_NUM" -eq 1 ]; then
    LINE_NUM=$((LINE_NUM + 1))
    continue
  fi

  # 범위 체크
  if [ "$LINE_NUM" -lt "$((START + 1))" ] || [ "$LINE_NUM" -gt "$((END + 1))" ]; then
    LINE_NUM=$((LINE_NUM + 1))
    continue
  fi

  # 이미 처리된 단어 스킵
  CARD_ID="${level}_$(echo "$expression" | md5sum | cut -c1-8)"
  if echo "$DONE_LIST" | grep -q "^$CARD_ID$"; then
    echo "  스킵 (완료): $expression"
    SKIPPED=$((SKIPPED + 1))
    LINE_NUM=$((LINE_NUM + 1))
    continue
  fi

  echo "  처리중 [$LINE_NUM]: $expression ($reading) - $meaningKo"

  # 프롬프트 생성
  PROMPT=$(cat "$PROMPT_TEMPLATE" \
    | sed "s/{{EXPRESSION}}/$expression/g" \
    | sed "s/{{READING}}/$reading/g" \
    | sed "s/{{ROMAJI}}/$romaji/g" \
    | sed "s/{{MEANING}}/$meaningKo/g" \
    | sed "s/{{POS}}/$partOfSpeech/g" \
    | sed "s/{{LEVEL}}/$level/g")

  # Claude 실행
  RESULT=$("$CLAUDE_BIN" -p "$PROMPT" --output-format text 2>/dev/null) || {
    echo "    ERROR: Claude 실행 실패 - $expression"
    ERRORS=$((ERRORS + 1))
    LINE_NUM=$((LINE_NUM + 1))
    continue
  }

  # JSON 추출 (```json ... ``` 블록 또는 그냥 JSON)
  CLEAN_JSON=$(echo "$RESULT" | sed -n '/^{/,/^}/p' | head -50)

  if [ -z "$CLEAN_JSON" ]; then
    echo "    ERROR: JSON 파싱 실패 - $expression"
    ERRORS=$((ERRORS + 1))
    LINE_NUM=$((LINE_NUM + 1))
    continue
  fi

  # 전체 카드 조립
  NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  CARD=$(node -e "
const ai = $CLEAN_JSON;
const card = {
  id: '${level}_' + require('crypto').createHash('md5').update('$expression').digest('hex').slice(0,8),
  expression: '$expression',
  reading: '$reading',
  romaji: '$romaji',
  meaningKo: '$meaningKo',
  partOfSpeech: '$partOfSpeech',
  jlptLevel: '${level^^}',
  source: 'jlpt',
  soundKo: ai.soundKo || '',
  mnemonic: ai.mnemonic || '',
  easyExplanation: ai.easyExplanation || '',
  kanjiNotes: ai.kanjiNotes || [],
  pronunciationNote: ai.pronunciationNote || '',
  exampleJa: ai.exampleJa || '',
  exampleReading: ai.exampleReading || '',
  exampleKo: ai.exampleKo || '',
  createdAt: '$NOW',
  updatedAt: '$NOW',
  review: {
    status: 'new',
    intervalDays: 1,
    lastReviewedAt: null,
    nextReviewAt: '$NOW',
    remembered: 0,
    confused: 0
  }
};
console.log(JSON.stringify(card));
" 2>/dev/null)

  if [ -n "$CARD" ]; then
    echo "$CARD" >> "$OUTPUT"
    echo "$CARD_ID" >> "$PROGRESS"
    PROCESSED=$((PROCESSED + 1))
    echo "    완료: $expression"
  else
    echo "    ERROR: 카드 조립 실패 - $expression"
    ERRORS=$((ERRORS + 1))
  fi

  LINE_NUM=$((LINE_NUM + 1))

  # API 부하 방지: 2초 대기
  sleep 2

done < "$CSV"

echo ""
echo "=== 완료 ==="
echo "처리: $PROCESSED개"
echo "스킵: $SKIPPED개 (이미 완료)"
echo "오류: $ERRORS개"
echo "출력 파일: $OUTPUT"
