# 소리장면 일본어

경선식 영단어 스타일로 일본어 단어를 외우는 Next.js MVP입니다.

## 실행

```bash
npm install
npm run dev
```

기본 주소:

```text
http://localhost:3000
```

현재 환경에서 3000 포트가 사용 중이면:

```bash
./node_modules/.bin/next dev -p 3001
```

## OpenAI API 연결

`.env.local`을 만들고 아래 값을 넣습니다.

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-5.2
```

API 키가 없으면 `/api/generate-card`는 샘플/mock 카드로 응답합니다.

## 로컬 OAuth 프록시 연결

개인 로컬 테스트에서만 사용할 수 있는 비공식 방식입니다. 배포 서비스에는 쓰지 마세요.

별도 터미널에서:

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH \
  npx openai-oauth --codex-version 0.140.0 --models gpt-5.4
```

앱의 `.env.local`:

```bash
AI_PROVIDER=oauth
OPENAI_OAUTH_BASE_URL=http://127.0.0.1:10531/v1
OPENAI_MODEL=gpt-5.4
```

주의:

- `openai-oauth`는 OpenAI 공식 프로젝트가 아닙니다.
- 로컬 Codex/ChatGPT OAuth auth 파일을 사용합니다.
- Codex 버전 자동 감지나 모델 목록 조회가 실패하지 않도록 버전과 모델을 명시합니다.
- 개인 로컬 실험용으로만 사용하세요.
- hosted service, 공유, 재배포 용도로 쓰면 안 됩니다.

## 주요 기능

- OpenAI API 기반 일본어 단어 카드 생성
- 경선식 스타일 암기문 생성
- 한자 의미 보강
- 단어장 저장
- 암기문 편집
- 복습 카드
- 퀴즈 모드
