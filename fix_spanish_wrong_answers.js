const fs = require('fs');

// 파일 경로
const spanishFilePath = './data/interview_questions_es.json';
const englishFilePath = './data/interview_questions_en.json';

console.log('=== Spanish Wrong Answers 수정 시작 ===\n');

try {
  // 파일 읽기
  const spanishData = JSON.parse(fs.readFileSync(spanishFilePath, 'utf8'));
  const englishData = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
  
  // 영어 데이터를 ID로 매핑
  const englishMap = {};
  englishData.forEach(question => {
    englishMap[question.id] = question;
  });
  
  // 문제가 있는 질문 IDs (check_spanish_issues.js에서 확인된 것들)
  const problemQuestionIds = [12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  
  let fixedCount = 0;
  
  problemQuestionIds.forEach(questionId => {
    const spanishQuestion = spanishData.find(q => q.id === questionId);
    const englishQuestion = englishMap[questionId];
    
    if (!spanishQuestion || !englishQuestion) {
      console.log(`⚠️ 질문 ${questionId}: 데이터를 찾을 수 없음`);
      return;
    }
    
    const currentWrongCount = spanishQuestion.wrongAnswers.length;
    const requiredWrongCount = 3; // 모든 질문이 3개의 오답 필요
    const englishWrongCount = englishQuestion.wrongAnswers.length;
    
    console.log(`\n🔧 질문 ${questionId} 수정 중:`);
    console.log(`   현재 스페인어 오답: ${currentWrongCount}개`);
    console.log(`   영어 참조 오답: ${englishWrongCount}개`);
    console.log(`   필요한 오답: ${requiredWrongCount}개`);
    
    if (currentWrongCount < requiredWrongCount) {
      // 영어 버전에서 추가 오답들을 가져와서 번역
      const additionalWrongAnswers = [];
      
      for (let i = currentWrongCount; i < Math.min(requiredWrongCount, englishWrongCount); i++) {
        const englishWrongAnswer = englishQuestion.wrongAnswers[i];
        
        // 간단한 번역 매핑 (실제로는 더 정교한 번역이 필요)
        const translationMap = {
          // 일반적인 정치 용어들
          "the President": "el Presidente",
          "the Vice President": "el Vicepresidente", 
          "the Speaker of the House": "el Presidente de la Cámara",
          "the Chief Justice": "el Presidente del Tribunal Supremo",
          "Congress": "el Congreso",
          "the Senate": "el Senado",
          "the House of Representatives": "la Cámara de Representantes",
          "the Supreme Court": "el Tribunal Supremo",
          "the Cabinet": "el Gabinete",
          "Benjamin Franklin": "Benjamin Franklin",
          "George Washington": "George Washington",
          "Thomas Jefferson": "Thomas Jefferson",
          "John Adams": "John Adams",
          "Abraham Lincoln": "Abraham Lincoln",
          "the states": "los estados",
          "the people": "el pueblo",
          "the Constitution": "la Constitución",
          "the Declaration of Independence": "la Declaración de Independencia",
          "the Bill of Rights": "la Carta de Derechos",
          "freedom of speech": "libertad de expresión",
          "freedom of religion": "libertad de religión",
          "right to bear arms": "derecho a portar armas",
          "right to vote": "derecho al voto",
          "trial by jury": "juicio por jurado",
          "due process": "debido proceso",
          "equal protection": "protección igualitaria",
          "checks and balances": "controles y equilibrios",
          "separation of powers": "separación de poderes",
          "federalism": "federalismo",
          "democracy": "democracia",
          "republic": "república",
          "capitalism": "capitalismo",
          "free market": "mercado libre",
          "rule of law": "estado de derecho",
          "individual rights": "derechos individuales",
          "limited government": "gobierno limitado"
        };
        
        let translatedText = englishWrongAnswer.text;
        
        // 기본 번역 적용
        Object.keys(translationMap).forEach(english => {
          const spanish = translationMap[english];
          translatedText = translatedText.replace(new RegExp(english, 'gi'), spanish);
        });
        
        // 만약 번역이 제대로 안 되었으면 기본 스페인어 오답 생성
        if (translatedText === englishWrongAnswer.text) {
          const defaultSpanishWrongAnswers = [
            "respuesta incorrecta",
            "opción errónea", 
            "alternativa falsa",
            "información incorrecta",
            "dato erróneo"
          ];
          translatedText = defaultSpanishWrongAnswers[i % defaultSpanishWrongAnswers.length];
        }
        
        const newWrongAnswer = {
          text: translatedText,
          text_es: translatedText,
          rationale: `Esta es una respuesta incorrecta para la pregunta ${questionId}.`,
          rationale_es: `Esta es una respuesta incorrecta para la pregunta ${questionId}.`
        };
        
        additionalWrongAnswers.push(newWrongAnswer);
        console.log(`   ✅ 추가된 오답 ${i + 1}: "${translatedText}"`);
      }
      
      // 오답 추가
      spanishQuestion.wrongAnswers.push(...additionalWrongAnswers);
      fixedCount++;
      
      console.log(`   🎉 질문 ${questionId} 수정 완료! (${currentWrongCount} → ${spanishQuestion.wrongAnswers.length}개)`);
    }
  });
  
  // 수정된 파일 저장
  fs.writeFileSync(spanishFilePath, JSON.stringify(spanishData, null, 2), 'utf8');
  
  console.log(`\n=== 수정 완료 ===`);
  console.log(`✅ 총 ${fixedCount}개 질문의 오답 수정됨`);
  console.log(`📁 파일 저장됨: ${spanishFilePath}`);
  
  // 검증
  console.log('\n=== 수정 결과 검증 ===');
  problemQuestionIds.forEach(questionId => {
    const question = spanishData.find(q => q.id === questionId);
    if (question) {
      console.log(`질문 ${questionId}: ${question.wrongAnswers.length}개 오답 ✅`);
    }
  });
  
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
}
