# 재부팅 후 실행 매뉴얼

컴퓨터를 껐다 켠 뒤 경선식 스타일 일본어 단어 암기 Next.js 앱을 다시 실행하는 순서다.

## 1. 프로젝트 폴더로 이동

```bash
cd "/home/seong/2026/harnessengineering_japan/memory-next-app"
```

## 2. Node.js 버전 맞추기

이 앱과 `openai-oauth`는 Node.js 20 기준으로 맞춰져 있다.

```bash
node -v
```

`v20.x.x`가 아니면:

```bash
nvm use 20
```

현재 터미널에서 `nvm use 20`이 안 먹거나 계속 `v12.x.x`가 나오면 아래처럼 PATH를 직접 앞에 붙인다.

```bash
export PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH
```

확인:

```bash
node -v
npm -v
```

정상 예:

```text
v20.20.2
```

## 3. 의존성 확인

`node_modules`가 없거나 에러가 나면 한 번 설치한다.

```bash
npm install
```

이미 설치되어 있으면 매번 할 필요는 없다.

## 4. 환경 변수 확인

`.env.local`이 아래처럼 되어 있어야 한다.

```bash
AI_PROVIDER=oauth
OPENAI_OAUTH_BASE_URL=http://127.0.0.1:10531/v1
OPENAI_MODEL=gpt-5.4
```

확인:

```bash
grep -E '^(AI_PROVIDER|OPENAI_OAUTH_BASE_URL|OPENAI_MODEL)=' .env.local
```

## 5. OpenAI OAuth 프록시 실행

이 앱은 개인 로컬 테스트용으로 `openai-oauth` 로컬 프록시를 사용할 수 있다.

별도 터미널 1개를 열고:

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH npx openai-oauth
```

정상이라면 로컬 프록시가 아래 주소로 열린다.

```text
http://127.0.0.1:10531/v1
```

정상 출력 예:

```text
OpenAI-compatible endpoint ready at http://127.0.0.1:10531/v1
Available Models: gpt-5.5, gpt-5.4, gpt-5.4-mini, codex-auto-review
```

로그인이 필요하다고 나오면:

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH npx @openai/codex login
```

로그인 후 다시:

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH npx openai-oauth
```

주의: 이 터미널은 계속 켜둔다.

## 6. Next.js 앱 실행

다른 터미널을 새로 열고:

```bash
cd "/home/seong/2026/harnessengineering_japan/memory-next-app"
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH ./node_modules/.bin/next dev -p 4320
```

브라우저에서 연다.

```text
http://localhost:4320
```

화면에서 일본어 단어를 입력하고 `AI 카드 생성`을 누른다.

예:

```text
勉強
```

## 7. API 직접 테스트

브라우저가 아니라 터미널에서 바로 확인하려면:

```bash
curl -s -X POST http://localhost:4320/api/generate-card \
  -H 'Content-Type: application/json' \
  -d '{"query":"勉強"}'
```

성공하면 응답에 아래처럼 나온다.

```json
"mode":"oauth"
```

`mode`가 `fallback`이면 프록시 연결, 환경 변수, 포트, 서버 재시작 여부를 확인한다.

## 8. 자주 나는 에러

### `SyntaxError: Unexpected token '?'`

Node.js 버전이 낮다. `node v12`로 실행하면 `openai-oauth`가 깨진다.

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH node -v
```

그 다음 다시:

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH npx openai-oauth
```

### `EADDRINUSE: address already in use :::4320`

4320 포트를 이미 다른 서버가 쓰고 있다.

먼저 4320을 잡고 있는 프로세스를 확인한다.

```bash
fuser -v 4320/tcp
```

예:

```text
4320/tcp: seong F.... next-server
```

PID가 보이면 해당 PID만 종료한다.

```bash
kill <PID>
```

그래도 안 죽으면:

```bash
kill -9 <PID>
```

한 번에 정리하려면:

```bash
kill -9 $(fuser 4320/tcp 2>/dev/null)
```

그 다음 다시 실행한다.

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH ./node_modules/.bin/next dev -p 4320
```

주의: `10531` 포트는 `openai-oauth` 프록시다. 죽이면 AI 생성이 안 된다.

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep 10531
```

아래처럼 보이면 정상이다.

```text
127.0.0.1:10531 (LISTEN)
```

4320을 꼭 유지할 필요가 없으면 포트를 바꿔서 실행해도 된다.

```bash
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH ./node_modules/.bin/next dev -p 4321
```

브라우저:

```text
http://localhost:4321
```

### `mode:"fallback"`이 나온다

가능한 원인:

- `openai-oauth` 터미널이 꺼져 있다.
- `.env.local`이 `AI_PROVIDER=oauth`가 아니다.
- `OPENAI_OAUTH_BASE_URL`이 `http://127.0.0.1:10531/v1`가 아니다.
- `.env.local` 수정 후 Next 서버를 재시작하지 않았다.
- 브라우저가 예전 포트에 접속 중이다.

확인:

```bash
grep -E '^(AI_PROVIDER|OPENAI_OAUTH_BASE_URL|OPENAI_MODEL)=' .env.local
curl -s http://127.0.0.1:10531/v1/models
```

### `Cannot find module './chunks/vendor-chunks/next.js'`

개발 서버가 켜진 상태에서 `next build`를 돌려 `.next` 캐시가 꼬인 경우다.

서버를 끄고 `.next` 캐시를 지운 뒤 다시 실행한다.

```bash
rm -rf .next
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH ./node_modules/.bin/next dev -p 4320
```

### `OPENAI_API_KEY` quota 에러

공식 OpenAI API 모드로 실행 중인 것이다.

개인 로컬 OAuth 프록시를 쓰려면 `.env.local`이 아래처럼 되어야 한다.

```bash
AI_PROVIDER=oauth
OPENAI_OAUTH_BASE_URL=http://127.0.0.1:10531/v1
OPENAI_MODEL=gpt-5.4
```

## 9. 한 번에 실행하는 요약

터미널 1:

```bash
cd "/home/seong/2026/harnessengineering_japan/memory-next-app"
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH npx openai-oauth
```

터미널 2:

```bash
cd "/home/seong/2026/harnessengineering_japan/memory-next-app"
PATH=/home/seong/.nvm/versions/node/v20.20.2/bin:$PATH ./node_modules/.bin/next dev -p 4320
```

브라우저:

```text
http://localhost:4320
```

## 10. 주의

`openai-oauth`는 OpenAI 공식 API가 아니라 비공식 로컬 프록시다.

- 개인 로컬 테스트용으로만 사용한다.
- 배포 서비스에 쓰지 않는다.
- OAuth/auth 파일을 공유하지 않는다.
- 다른 사람에게 프록시 주소를 열어주지 않는다.
