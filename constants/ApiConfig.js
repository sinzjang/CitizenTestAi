// API 설정 - Vercel 프록시 사용
export const API_CONFIG = {
  // Vercel 프록시 엔드포인트
  OPENAI_CHAT_URL: 'https://citizen-test-ai.vercel.app/api/openai',
  OPENAI_SPEECH_URL: 'https://citizen-test-ai.vercel.app/api/speech',
  
  // 기본 헤더 (Authorization 불필요)
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // OpenAI 모델 설정
  MODELS: {
    CHAT: 'gpt-3.5-turbo',
    TTS: 'tts-1-hd',
  }
};

// API 호출 헬퍼 함수
export const callOpenAI = async (messages, options = {}) => {
  const response = await fetch(API_CONFIG.OPENAI_CHAT_URL, {
    method: 'POST',
    headers: API_CONFIG.DEFAULT_HEADERS,
    body: JSON.stringify({
      model: API_CONFIG.MODELS.CHAT,
      messages: messages,
      max_tokens: options.maxTokens || 300,
      temperature: options.temperature || 0.7,
      ...options
    })
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

export const callTTS = async (text, voice = 'alloy') => {
  const response = await fetch(API_CONFIG.OPENAI_SPEECH_URL, {
    method: 'POST',
    headers: API_CONFIG.DEFAULT_HEADERS,
    body: JSON.stringify({
      model: API_CONFIG.MODELS.TTS,
      input: text,
      voice: voice
    })
  });
  
  if (!response.ok) {
    throw new Error(`TTS Error: ${response.status}`);
  }
  
  return response.arrayBuffer();
};
