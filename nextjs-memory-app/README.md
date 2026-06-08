# 소리장면 일본어 Next.js 배포용

이 폴더는 GitHub/Vercel 같은 Next.js import 도구가 바로 인식할 수 있도록 만든 독립 Next.js 앱 폴더입니다.

## Vercel import 설정

- Framework Preset: `Next.js`
- Root Directory: `nextjs-memory-app`
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: 비워둠

## 로컬 실행

```bash
npm install
npm run dev
```

기본 주소:

```text
http://localhost:3000
```

## 환경변수

API 키 없이도 mock 카드로 동작합니다. OpenAI API를 연결하려면 Vercel Environment Variables 또는 `.env.local`에 아래 값을 설정합니다.

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-5.2
```
