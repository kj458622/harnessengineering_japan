import { NextRequest, NextResponse } from "next/server";
import { GeneratedCardPayload } from "@/lib/types";
import { seedCards } from "@/lib/cards";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const AI_PROVIDER = process.env.AI_PROVIDER || "openai";
const OPENAI_OAUTH_BASE_URL = process.env.OPENAI_OAUTH_BASE_URL || "http://127.0.0.1:10531/v1";

export async function POST(request: NextRequest) {
  const { query } = (await request.json()) as { query?: string };
  const input = query?.trim();

  if (!input) {
    return NextResponse.json({ error: "단어를 입력해 주세요." }, { status: 400 });
  }

  const sample = findSample(input);
  if (AI_PROVIDER !== "oauth" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      card: sample ? toPayload(sample) : makeMockCard(input, "OPENAI_API_KEY가 없어 샘플/mock 카드로 응답했습니다."),
      mode: "mock",
      message: "OPENAI_API_KEY가 없어 샘플/mock 카드로 응답했습니다."
    });
  }

  try {
    const generated = await generateCard(input);
    return NextResponse.json({ card: generated, mode: AI_PROVIDER === "oauth" ? "oauth" : "ai" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      card: sample ? toPayload(sample) : makeMockCard(input, "AI 생성에 실패했습니다. 결제/쿼터/모델 권한을 확인한 뒤 다시 시도하세요."),
      mode: "fallback",
      message: "AI 생성에 실패해 fallback 카드로 응답했습니다."
    });
  }
}

function findSample(input: string) {
  const normalized = input.toLowerCase();
  return seedCards.find((card) => {
    return [card.expression, card.reading, card.romaji, card.meaningKo, card.soundKo].some((value) => {
      const target = value.toLowerCase();
      return target.includes(normalized) || normalized.includes(target);
    });
  });
}

function toPayload(card: (typeof seedCards)[number]): GeneratedCardPayload {
  return {
    expression: card.expression,
    reading: card.reading,
    romaji: card.romaji,
    meaningKo: card.meaningKo,
    partOfSpeech: card.partOfSpeech,
    soundKo: card.soundKo,
    mnemonic: card.mnemonic,
    easyExplanation: card.easyExplanation,
    kanjiNotes: card.kanjiNotes,
    pronunciationNote: card.pronunciationNote,
    exampleJa: card.exampleJa,
    exampleReading: card.exampleReading,
    exampleKo: card.exampleKo,
    source: card.source,
    jlptLevel: card.jlptLevel
  };
}

function makeMockCard(input: string, reason: string): GeneratedCardPayload {
  return {
    expression: input,
    reading: input,
    romaji: "",
    meaningKo: "뜻 확인 필요",
    partOfSpeech: "직접 확인",
    soundKo: input,
    mnemonic: `${input}의 소리와 뜻을 연결하는 내 암기문을 직접 다듬어 보세요.`,
    easyExplanation: `아직 샘플 단어장에 없는 단어입니다. ${reason}`,
    kanjiNotes: [],
    pronunciationNote: "AI 응답을 받지 못해 발음 분석이 mock으로 표시됩니다.",
    exampleJa: `${input}を覚えます。`,
    exampleReading: "",
    exampleKo: `${input}를 외웁니다.`,
    source: "mock"
  };
}

async function generateCard(input: string): Promise<GeneratedCardPayload> {
  if (AI_PROVIDER === "oauth") {
    return generateWithOAuthProxy(input);
  }

  const url = AI_PROVIDER === "oauth" ? `${OPENAI_OAUTH_BASE_URL.replace(/\/$/, "")}/responses` : "https://api.openai.com/v1/responses";
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (AI_PROVIDER !== "oauth") {
    headers.Authorization = `Bearer ${process.env.OPENAI_API_KEY}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "너는 한국어 사용자를 위한 일본어 단어 암기 코치다.",
                "경선식 영단어 스타일로 일본어 전체 발음과 한국어 뜻을 연결하는 짧은 암기문을 만든다.",
                "글자별로 억지 분해하지 말고, 전체 발음과 뜻을 하나의 장면으로 묶는다.",
                "형용사 끝 い, 동사 어미 등 문법 꼬리는 핵심 암기법으로 만들지 않는다.",
                "한자가 있으면 암기문 뒤에 한자 의미를 짧게 보강한다.",
                "한자 보강은 한자별로 부수/구성요소를 분리해서 자세히 설명한다.",
                "각 한자에는 components 배열을 넣고, 구성요소의 shape, name, meaning, role을 채운다.",
                "각 한자에는 meaningFlow를 넣어 구성요소들이 어떻게 전체 뜻으로 이어지는지 1~2문장으로 설명한다.",
                "불확실한 어원은 확정적으로 말하지 않는다.",
                "반드시 JSON만 출력한다."
              ].join("\n")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `일본어 단어 카드 생성: ${input}`
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "japanese_memory_card",
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "expression",
              "reading",
              "romaji",
              "meaningKo",
              "partOfSpeech",
              "soundKo",
              "mnemonic",
              "easyExplanation",
              "kanjiNotes",
              "pronunciationNote",
              "exampleJa",
              "exampleReading",
              "exampleKo",
              "source",
              "jlptLevel"
            ],
            properties: {
              expression: { type: "string" },
              reading: { type: "string" },
              romaji: { type: "string" },
              meaningKo: { type: "string" },
              partOfSpeech: { type: "string" },
              soundKo: { type: "string" },
              mnemonic: { type: "string" },
              easyExplanation: { type: "string" },
              kanjiNotes: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["kanji", "koreanSound", "meaning", "easyStory", "components", "meaningFlow"],
                  properties: {
                    kanji: { type: "string" },
                    koreanSound: { type: "string" },
                    meaning: { type: "string" },
                    easyStory: { type: "string" },
                    meaningFlow: { type: "string" },
                    components: {
                      type: "array",
                      items: {
                        type: "object",
                        additionalProperties: false,
                        required: ["shape", "name", "meaning", "role"],
                        properties: {
                          shape: { type: "string" },
                          name: { type: "string" },
                          meaning: { type: "string" },
                          role: { type: "string" }
                        }
                      }
                    }
                  }
                }
              },
              pronunciationNote: { type: "string" },
              exampleJa: { type: "string" },
              exampleReading: { type: "string" },
              exampleKo: { type: "string" },
              source: { type: "string", enum: ["ai"] },
              jlptLevel: { type: "string" }
            }
          },
          strict: true
        }
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }

  const data = (await response.json()) as OpenAIResponse;
  const text = extractText(data);
  const parsed = JSON.parse(text) as GeneratedCardPayload;

  return {
    ...parsed,
    source: "ai",
    kanjiNotes: Array.isArray(parsed.kanjiNotes) ? parsed.kanjiNotes : []
  };
}

async function generateWithOAuthProxy(input: string): Promise<GeneratedCardPayload> {
  const response = await fetch(`${OPENAI_OAUTH_BASE_URL.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: [
            "너는 한국어 사용자를 위한 일본어 단어 암기 코치다.",
            "경선식 영단어 스타일로 일본어 전체 발음과 한국어 뜻을 연결하는 짧은 암기문을 만든다.",
            "글자별로 억지 분해하지 말고, 전체 발음과 뜻을 하나의 장면으로 묶는다.",
            "형용사 끝 い, 동사 어미 등 문법 꼬리는 핵심 암기법으로 만들지 않는다.",
            "한자가 있으면 암기문 뒤에 한자 의미를 짧게 보강한다.",
            "한자 보강은 반드시 부수/구성요소를 분리해서 자세히 설명한다.",
            "예: 専門이면 専은 '오로지, 전문으로 하다'이고 구성요소가 하나에 집중하는 느낌을 만든다고 설명한다. 門은 문, 분야로 들어가는 입구처럼 설명한다.",
            "각 한자에는 components 배열을 넣는다. 각 component는 shape, name, meaning, role을 가진다.",
            "각 한자에는 meaningFlow를 넣는다. 구성요소들이 어떻게 전체 뜻으로 이어지는지 1~2문장으로 쉽게 설명한다.",
            "부수 설명이 역사적으로 불확실하면 '학습용 연상'이라고 표시한다.",
            "불확실한 어원은 확정적으로 말하지 않는다.",
            "반드시 JSON만 출력한다. 코드블록, 설명 문장, 마크다운을 쓰지 않는다.",
            "JSON 필드: expression, reading, romaji, meaningKo, partOfSpeech, soundKo, mnemonic, easyExplanation, kanjiNotes, pronunciationNote, exampleJa, exampleReading, exampleKo, source, jlptLevel.",
            "kanjiNotes는 배열이며 각 항목은 kanji, koreanSound, meaning, easyStory, meaningFlow, components를 가진다.",
            "components는 배열이며 각 항목은 shape, name, meaning, role을 가진다.",
            "source는 반드시 ai로 둔다. jlptLevel을 모르면 빈 문자열로 둔다."
          ].join("\n")
        },
        {
          role: "user",
          content: `일본어 단어 카드 생성: ${input}`
        }
      ]
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message);
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content || "";
  const parsed = JSON.parse(stripCodeFence(content)) as GeneratedCardPayload;

  return {
    ...parsed,
    source: "ai",
    kanjiNotes: Array.isArray(parsed.kanjiNotes) ? parsed.kanjiNotes : []
  };
}

function extractText(data: OpenAIResponse) {
  if (data.output_text) return data.output_text;

  const chunks =
    data.output
      ?.flatMap((item) => item.content || [])
      .map((content) => content.text || "")
      .filter(Boolean) || [];

  return chunks.join("\n");
}

function stripCodeFence(content: string) {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}
