const fs = require('fs');

console.log('🎯 남은 50개 이슈 최종 수정 시작...\n');

// 스페인어 질문 파일 로드
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

// 백업 생성
const backupFilename = `./data/interview_questions_es_backup_final_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`;
fs.writeFileSync(backupFilename, JSON.stringify(spanishQuestions, null, 2));
console.log(`📁 백업 파일 생성: ${backupFilename}`);

// 남은 특정 이슈들을 위한 정밀 수정 함수
function fixRemainingIssues(text) {
  if (!text) return text;
  
  let fixed = text;
  
  // 남은 혼재 패턴들 수정
  const remainingPatterns = [
    // "un nivel de Gabinete" -> "a nivel de Gabinete"
    { pattern: /\bun nivel de Gabinete\b/g, replacement: 'a nivel de Gabinete' },
    
    // "un la Constitución" -> "en la Constitución"
    { pattern: /\bun la Constitución\b/g, replacement: 'en la Constitución' },
    
    // "that es only para" -> "que es solo para"
    { pattern: /\bthat es only para\b/g, replacement: 'que es solo para' },
    
    // "un cuándo we say" -> "cuando decimos"
    { pattern: /\bun cuándo we say\b/g, replacement: 'cuando decimos' },
    
    // "un be un vote" -> "para votar"
    { pattern: /\bun be un vote\b/g, replacement: 'para votar' },
    
    // "puede servir" -> "puede servir" (이미 올바름, 하지만 문맥 확인)
    { pattern: /\bya no puede servir\b/g, replacement: 'ya no puede servir' },
    
    // "about quién puede" -> "sobre quién puede"
    { pattern: /\babout quién puede\b/g, replacement: 'sobre quién puede' },
    
    // "we say el Pledge" -> "decimos el Juramento"
    { pattern: /\bwe say el Pledge\b/g, replacement: 'decimos el Juramento' },
    
    // "el Pledge de Allegiance" -> "el Juramento de Lealtad"
    { pattern: /\bel Pledge de Allegiance\b/g, replacement: 'el Juramento de Lealtad' },
    
    // "Selective Service" -> "Servicio Selectivo"
    { pattern: /\bSelective Service\b/g, replacement: 'Servicio Selectivo' },
    
    // 기타 영어 단어들
    { pattern: /\babout\b/g, replacement: 'sobre' },
    { pattern: /\bthat\b/g, replacement: 'que' },
    { pattern: /\bonly\b/g, replacement: 'solo' },
    { pattern: /\bwhen\b/g, replacement: 'cuando' },
    { pattern: /\bsay\b/g, replacement: 'decir' },
    { pattern: /\bwe\b/g, replacement: 'nosotros' },
    { pattern: /\bshow\b/g, replacement: 'mostrar' },
    { pattern: /\bloyalty\b/g, replacement: 'lealtad' },
    { pattern: /\bold\b/g, replacement: 'edad' },
    { pattern: /\bcitizens\b/g, replacement: 'ciudadanos' },
    { pattern: /\bvote\b/g, replacement: 'votar' },
    { pattern: /\bPresident\b/g, replacement: 'Presidente' },
    { pattern: /\blevel\b/g, replacement: 'nivel' },
    { pattern: /\bCabinet\b/g, replacement: 'Gabinete' },
    { pattern: /\bConstitution\b/g, replacement: 'Constitución' },
    { pattern: /\bresponsibility\b/g, replacement: 'responsabilidad' },
    { pattern: /\bright\b/g, replacement: 'derecho' },
    { pattern: /\bcitizens\b/g, replacement: 'ciudadanos' },
    { pattern: /\bUnited States\b/g, replacement: 'Estados Unidos' },
    { pattern: /\bAmericans\b/g, replacement: 'estadounidenses' },
    { pattern: /\bparticipate\b/g, replacement: 'participar' },
    { pattern: /\bdemocracy\b/g, replacement: 'democracia' },
    { pattern: /\bgovernment\b/g, replacement: 'gobierno' },
    { pattern: /\bfederal\b/g, replacement: 'federal' },
    { pattern: /\bstate\b/g, replacement: 'estado' },
    { pattern: /\blocal\b/g, replacement: 'local' }
  ];
  
  // 패턴 적용
  for (const {pattern, replacement} of remainingPatterns) {
    if (pattern.test(fixed)) {
      const matches = fixed.match(pattern);
      if (matches) {
        console.log(`   🔄 수정: "${matches[0]}" → "${replacement}"`);
        fixed = fixed.replace(pattern, replacement);
      }
    }
  }
  
  return fixed;
}

// 특정 질문들에 대한 맞춤형 수정
function fixSpecificQuestions(question) {
  const questionId = question.id;
  
  // 질문 48: "Hay cuatro enmiendas un la Constitución about quién puede votar"
  if (questionId === 48) {
    question.question = question.question.replace(/Hay cuatro enmiendas un la Constitución about quién puede votar/, 'Hay cuatro enmiendas en la Constitución sobre quién puede votar');
  }
  
  // 질문 49: "¿cuál es una responsabilidad that es only para Estados Unidos citizens?"
  if (questionId === 49) {
    question.question = question.question.replace(/¿cuál es una responsabilidad that es only para Estados Unidos citizens\?/, '¿cuál es una responsabilidad que es solo para ciudadanos de Estados Unidos?');
  }
  
  // 질문 52: "¿qué mostramos lealtad un cuándo we say el Pledge de Allegiance?"
  if (questionId === 52) {
    question.question = question.question.replace(/¿qué mostramos lealtad un cuándo we say el Pledge de Allegiance\?/, '¿qué mostramos lealtad cuando decimos el Juramento de Lealtad?');
  }
  
  // 질문 54: "¿qué edad deben tener los ciudadanos un be un vote para President?"
  if (questionId === 54) {
    question.question = question.question.replace(/¿qué edad deben tener los ciudadanos un be un vote para President\?/, '¿qué edad deben tener los ciudadanos para votar por el Presidente?');
  }
  
  // 질문 30: "Si el Presidente ya no puede servir"
  if (questionId === 30) {
    question.question = question.question.replace(/Si el Presidente ya no puede servir/, 'Si el Presidente ya no puede servir');
  }
  
  // 질문 36: "¿Cuáles son dos puestos un nivel de Gabinete?"
  if (questionId === 36) {
    question.question = question.question.replace(/¿Cuáles son dos puestos un nivel de Gabinete\?/, '¿Cuáles son dos puestos a nivel de Gabinete?');
  }
  
  // 질문 41: "algunos poderes pertenecen al gobierno federal"
  if (questionId === 41) {
    question.question = question.question.replace(/algunos poderes pertenecen al gobierno federal/, 'algunos poderes pertenecen al gobierno federal');
  }
}

// 수정 통계
let totalFixed = 0;
let questionsFixed = 0;

console.log('🎯 남은 이슈들 정밀 수정 시작...\n');

// 각 질문 수정
for (let i = 0; i < spanishQuestions.length; i++) {
  const question = spanishQuestions[i];
  let questionFixed = false;
  
  // 특정 질문들 맞춤형 수정
  const originalQuestion = question.question;
  fixSpecificQuestions(question);
  if (originalQuestion !== question.question) {
    console.log(`📝 질문 ${question.id} 맞춤형 수정:`);
    console.log(`   이전: "${originalQuestion}"`);
    console.log(`   수정: "${question.question}"`);
    questionFixed = true;
    totalFixed++;
  }
  
  // 질문 텍스트 일반 수정
  const beforeGeneral = question.question;
  question.question = fixRemainingIssues(question.question);
  if (beforeGeneral !== question.question) {
    console.log(`📝 질문 ${question.id} 일반 수정:`);
    console.log(`   이전: "${beforeGeneral}"`);
    console.log(`   수정: "${question.question}"`);
    questionFixed = true;
    totalFixed++;
  }
  
  // 정답 수정
  question.correctAnswers.forEach((answer, index) => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = fixRemainingIssues(answer.text);
    answer.rationale = fixRemainingIssues(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      console.log(`✅ 질문 ${question.id} 정답 ${index + 1} 수정:`);
      if (originalText !== answer.text) {
        console.log(`   텍스트: "${originalText}" → "${answer.text}"`);
        totalFixed++;
      }
      if (originalRationale !== answer.rationale) {
        console.log(`   설명: "${originalRationale}" → "${answer.rationale}"`);
        totalFixed++;
      }
      questionFixed = true;
    }
  });
  
  // 오답 수정
  question.wrongAnswers.forEach((answer, index) => {
    const originalText = answer.text;
    const originalRationale = answer.rationale;
    
    answer.text = fixRemainingIssues(answer.text);
    answer.rationale = fixRemainingIssues(answer.rationale);
    
    if (originalText !== answer.text || originalRationale !== answer.rationale) {
      console.log(`❌ 질문 ${question.id} 오답 ${index + 1} 수정:`);
      if (originalText !== answer.text) {
        console.log(`   텍스트: "${originalText}" → "${answer.text}"`);
        totalFixed++;
      }
      if (originalRationale !== answer.rationale) {
        console.log(`   설명: "${originalRationale}" → "${answer.rationale}"`);
        totalFixed++;
      }
      questionFixed = true;
    }
  });
  
  if (questionFixed) {
    questionsFixed++;
  }
  
  // 진행률 표시
  if ((i + 1) % 25 === 0) {
    console.log(`📊 진행률: ${i + 1}/100 (${Math.round((i + 1)/100*100)}%)`);
  }
}

// 수정된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 남은 이슈 수정 완료!`);
console.log(`📊 수정 결과:`);
console.log(`  - 수정된 질문: ${questionsFixed}개`);
console.log(`  - 총 수정된 항목: ${totalFixed}개`);
console.log(`  - 백업 파일: ${backupFilename}`);

console.log(`\n🔍 최종 검증: 분석 스크립트를 다시 실행하여 100% 달성 확인`);
console.log(`   node final_accurate_analysis.js`);
