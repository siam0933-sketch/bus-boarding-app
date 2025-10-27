/**
 * Google Gemini AI service
 * Handles natural language commands for boarding list management
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Call Gemini API with a prompt
 */
const callGeminiAPI = async (prompt: string, apiKey: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini');
  }

  return data.candidates[0].content.parts[0].text;
};

/**
 * Parse action and execute
 * This will be connected to AppContext later
 */
export interface AIAction {
  action: 'add' | 'remove' | 'update';
  studentName?: string;
  route?: string;
  day?: string;
  station?: string;
  time?: string;
  message: string;
}

/**
 * Execute AI command
 * Translates natural language to structured actions
 */
export const executeAICommand = async (command: string, apiKey: string): Promise<AIAction> => {
  const systemPrompt = `당신은 학원 버스 탑승 관리 시스템의 AI 어시스턴트입니다.
사용자의 명령을 분석하여 다음 JSON 형식으로 응답하세요:

{
  "action": "add" | "remove" | "update",
  "studentName": "학생 이름",
  "route": "노선명 (예: 3시부, 5시부)",
  "day": "요일 (월/화/수/목/금)",
  "station": "정류장 이름",
  "time": "시간 (HH:MM 형식)",
  "message": "사용자에게 보여줄 메시지"
}

예시:
명령: "김철수를 3시부 노선에 추가해줘"
응답: {
  "action": "add",
  "studentName": "김철수",
  "route": "3시부",
  "message": "김철수 학생을 3시부 노선에 추가했습니다."
}

명령: "박민수를 월요일 5시부에서 제거"
응답: {
  "action": "remove",
  "studentName": "박민수",
  "route": "5시부",
  "day": "월",
  "message": "박민수 학생을 월요일 5시부 노선에서 제거했습니다."
}

명령: "이지은의 정류장을 학교앞으로 변경"
응답: {
  "action": "update",
  "studentName": "이지은",
  "station": "학교앞",
  "message": "이지은 학생의 정류장을 학교앞으로 변경했습니다."
}

현재 명령: ${command}

반드시 JSON 형식으로만 응답하세요. 다른 설명은 포함하지 마세요.`;

  try {
    const response = await callGeminiAPI(systemPrompt, apiKey);

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답을 파싱할 수 없습니다.');
    }

    const parsedResponse: AIAction = JSON.parse(jsonMatch[0]);

    // Return the parsed action
    return parsedResponse;

  } catch (error: any) {
    console.error('Gemini AI error:', error);
    throw new Error(error.message || 'AI 명령 처리 중 오류가 발생했습니다.');
  }
};
