const fs = require('fs');

// 영어 템플릿과 스페인어 파일 로드
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🔄 스페인어 파일을 영어 템플릿 기준으로 동기화 시작...\n');

// 기존 스페인어 번역을 ID별로 매핑
const spanishMap = {};
spanishQuestions.forEach(q => {
  spanishMap[q.id] = q;
});

// 스페인어 번역 사전 (기본 번역)
const spanishTranslations = {
  // 기본 오답 템플릿
  wrongAnswerTemplates: {
    1: "Respuesta incorrecta",
    2: "Información incorrecta, Respuesta errónea", 
    3: "Respuesta incorrecta, Información errónea, Respuesta falsa",
    4: "Respuesta incorrecta, Información errónea, Respuesta falsa, Datos incorrectos",
    5: "Respuesta incorrecta, Información errónea, Respuesta falsa, Datos incorrectos, Información falsa"
  },
  wrongAnswerRationale: "La respuesta correcta debe tener {count} partes. Esta respuesta es incompleta o incorrecta.",
  
  // 최신 정보 번역
  currentOfficials: {
    "Donald J. Trump": "Donald J. Trump",
    "JD Vance": "JD Vance",
    "(As of July 2025)": "(A partir de julio de 2025)"
  }
};

function countCommas(text) {
  if (!text) return 0;
  // 날짜 패턴 내의 콤마는 제외
  const datePattern = /\b\w+\s+\d{1,2},\s+\d{4}\b/g;
  let cleanText = text.replace(datePattern, (match) => match.replace(/,/g, ''));
  return (cleanText.match(/,/g) || []).length;
}

function translateBasicText(englishText) {
  // 기본적인 번역 매핑
  const basicTranslations = {
    "What is": "¿Qué es",
    "What does": "¿Qué hace",
    "What are": "¿Cuáles son",
    "Who": "¿Quién",
    "When": "¿Cuándo",
    "Where": "¿Dónde",
    "How": "¿Cómo",
    "Why": "¿Por qué",
    "the Constitution": "la Constitución",
    "the President": "el Presidente",
    "Congress": "el Congreso",
    "the Supreme Court": "la Corte Suprema",
    "United States": "Estados Unidos",
    "America": "América",
    "American": "estadounidense"
  };
  
  let translated = englishText;
  Object.keys(basicTranslations).forEach(en => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, basicTranslations[en]);
  });
  
  return translated;
}

function preserveExistingTranslation(englishText, existingSpanishText) {
  // 기존 번역이 있고 영어와 다르면 기존 번역 유지
  if (existingSpanishText && existingSpanishText !== englishText && 
      !existingSpanishText.includes('[번역 필요]') && 
      existingSpanishText.length > 5) {
    return existingSpanishText;
  }
  
  // 최신 정보 번역 적용
  if (spanishTranslations.currentOfficials[englishText]) {
    return spanishTranslations.currentOfficials[englishText];
  }
  
  // 기본 번역 시도
  const basicTranslation = translateBasicText(englishText);
  if (basicTranslation !== englishText) {
    return basicTranslation;
  }
  
  // 번역이 필요한 항목 표시
  return `[Traducción necesaria] ${englishText}`;
}

// 동기화된 스페인어 질문 생성
const synchronizedSpanishQuestions = englishQuestions.map(enQ => {
  const existingSpanish = spanishMap[enQ.id];
  
  // 질문 번역
  const questionTranslation = existingSpanish?.question || preserveExistingTranslation(enQ.question, existingSpanish?.question);
  
  // 정답 번역
  const correctAnswers = enQ.correctAnswers.map((correctAnswer, index) => {
    const existingCorrect = existingSpanish?.correctAnswers?.[index];
    return {
      text: preserveExistingTranslation(correctAnswer.text, existingCorrect?.text),
      rationale: preserveExistingTranslation(correctAnswer.rationale, existingCorrect?.rationale)
    };
  });
  
  // 오답 생성 - 정답 개수에 맞춰 생성
  const wrongAnswers = enQ.wrongAnswers.map((wrongAnswer, index) => {
    const existingWrong = existingSpanish?.wrongAnswers?.[index];
    
    // 기존 번역이 있고 구조가 맞으면 유지
    if (existingWrong && existingWrong.text && existingWrong.rationale) {
      const correctAnswerCount = enQ.correctAnswers.length;
      const correctCommaCount = correctAnswerCount > 1 ? correctAnswerCount - 1 : 0;
      const existingCommaCount = countCommas(existingWrong.text);
      
      // 구조가 맞으면 기존 번역 유지
      if (correctCommaCount === existingCommaCount) {
        return {
          text: existingWrong.text,
          rationale: existingWrong.rationale
        };
      }
    }
    
    // 새로운 오답 생성
    const correctAnswerCount = enQ.correctAnswers.length;
    const wrongAnswerTemplate = spanishTranslations.wrongAnswerTemplates[correctAnswerCount] || 
                               spanishTranslations.wrongAnswerTemplates[1];
    
    return {
      text: wrongAnswerTemplate,
      rationale: spanishTranslations.wrongAnswerRationale.replace('{count}', correctAnswerCount)
    };
  });
  
  return {
    id: enQ.id,
    question: questionTranslation,
    correctAnswers: correctAnswers,
    wrongAnswers: wrongAnswers
  };
});

// 백업 생성
const backupFilename = `./data/interview_questions_es_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
fs.writeFileSync(backupFilename, JSON.stringify(spanishQuestions, null, 2));
console.log(`📁 기존 스페인어 파일 백업: ${backupFilename}`);

// 동기화된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(synchronizedSpanishQuestions, null, 2));

// 결과 분석
let translationNeeded = 0;
let preservedTranslations = 0;
let newStructures = 0;

synchronizedSpanishQuestions.forEach(q => {
  if (q.question.includes('[Traducción necesaria]')) translationNeeded++;
  
  q.correctAnswers.forEach(answer => {
    if (answer.text.includes('[Traducción necesaria]')) translationNeeded++;
    if (answer.rationale.includes('[Traducción necesaria]')) translationNeeded++;
    else if (!answer.text.includes('Respuesta incorrecta')) preservedTranslations++;
  });
  
  // 새로 생성된 구조 확인
  const originalSpanish = spanishMap[q.id];
  if (!originalSpanish || originalSpanish.correctAnswers.length !== q.correctAnswers.length) {
    newStructures++;
  }
});

console.log('\n✅ 스페인어 파일 동기화 완료!');
console.log(`📊 동기화 결과:`);
console.log(`  - 총 문제 수: ${synchronizedSpanishQuestions.length}개`);
console.log(`  - 구조 수정된 문제: ${newStructures}개`);
console.log(`  - 기존 번역 유지: ${preservedTranslations}개 항목`);
console.log(`  - 번역 필요 항목: ${translationNeeded}개`);

console.log('\n🎯 다음 단계:');
console.log('1. 번역 필요 항목 수동 번역');
console.log('2. 최신 정보 (정치인, 날짜 등) 업데이트');
console.log('3. 번역 품질 검토 및 개선');

// 번역 필요 항목 목록 생성
const translationTasks = [];
synchronizedSpanishQuestions.forEach(q => {
  if (q.question.includes('[Traducción necesaria]')) {
    translationTasks.push({
      id: q.id,
      type: 'question',
      text: q.question.replace('[Traducción necesaria] ', '')
    });
  }
  
  q.correctAnswers.forEach((answer, index) => {
    if (answer.text.includes('[Traducción necesaria]')) {
      translationTasks.push({
        id: q.id,
        type: 'correctAnswer',
        index: index,
        field: 'text',
        text: answer.text.replace('[Traducción necesaria] ', '')
      });
    }
    if (answer.rationale.includes('[Traducción necesaria]')) {
      translationTasks.push({
        id: q.id,
        type: 'correctAnswer',
        index: index,
        field: 'rationale',
        text: answer.rationale.replace('[Traducción necesaria] ', '')
      });
    }
  });
});

if (translationTasks.length > 0) {
  fs.writeFileSync('./spanish_translation_tasks.json', JSON.stringify(translationTasks, null, 2));
  console.log(`\n📝 번역 작업 목록이 spanish_translation_tasks.json에 저장되었습니다.`);
  console.log(`   총 ${translationTasks.length}개 항목이 번역을 기다리고 있습니다.`);
}
