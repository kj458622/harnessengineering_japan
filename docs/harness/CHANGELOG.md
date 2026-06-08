# Harness Changelog

## 2026-06-01

- Claude 기반 `CLAUDE.md`, `.claude/agents`, `.claude/skills` 구조를 Codex Agent 기준으로 재기획했다.
- 루트 `AGENTS.md`를 추가해 Codex 라우팅과 응답 원칙을 정의했다.
- `skills/japanese-word-study` 오케스트레이터 스킬을 추가했다.
- `skills/kanji-analysis`, `skills/reading-coach` 보조 스킬을 추가했다.
- 평가 프롬프트 문서 `docs/harness/EVALS.md`를 추가했다.
- 반복 개선 기록용 `docs/harness/LESSONS.md`를 추가했다.
- Claude 버전처럼 쉬운 설명, 상황 비유, 한 줄 기억법을 먼저 제공하도록 응답 톤을 보강했다.
- 읽기 기억법을 글자별 분해 기본값에서 전체 단어 소리 기반 통암기 방식으로 변경했다.
- 경선식 영단어 스타일 소리 연상 암기법을 일본어 단어 학습 하네스의 기본 암기 엔진으로 승격했다.
