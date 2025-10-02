const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🇪🇸 스페인어 남은 항목 최종 정리...\n');

// 남은 혼재 패턴들을 위한 정리 사전
const cleanupPatterns = [
  // 혼재된 패턴들 정리
  [/the U\.S\. Constitution/g, 'la Constitución de EE.UU.'],
  [/the U\.S\./g, 'EE.UU.'],
  [/the Constitution/g, 'la Constitución'],
  [/the President/g, 'el Presidente'],
  [/the Vice President/g, 'el Vicepresidente'],
  [/the Speaker/g, 'el Presidente'],
  [/the House/g, 'la Cámara'],
  [/the Senate/g, 'el Senado'],
  [/the Congress/g, 'el Congreso'],
  [/the Supreme Court/g, 'el Tribunal Supremo'],
  [/the Chief Justice/g, 'el Presidente del Tribunal Supremo'],
  [/the Secretary of State/g, 'el Secretario de Estado'],
  
  // 동사 패턴 정리
  [/ fue firmada/, ' fue firmada'],
  [/ was signed/, ' fue firmada'],
  [/ was written/, ' fue escrita'],
  [/ was adopted/, ' fue adoptada'],
  [/ were written/, ' fueron escritos'],
  [/ is celebrated/, ' se celebra'],
  [/ are celebrated/, ' se celebran'],
  
  // 날짜와 시간 패턴
  [/in 1787/, 'en 1787'],
  [/in 1776/, 'en 1776'],
  [/in 1492/, 'en 1492'],
  [/in 1775/, 'en 1775'],
  [/during the/, 'durante la'],
  
  // 기타 일반적인 패턴
  [/United States/, 'Estados Unidos'],
  [/Declaration of Independence/, 'Declaración de Independencia'],
  [/Bill of Rights/, 'Carta de Derechos'],
  [/Revolutionary War/, 'Guerra Revolucionaria'],
  [/Civil War/, 'Guerra Civil'],
  [/Independence Day/, 'Día de la Independencia'],
  [/Continental Army/, 'Ejército Continental'],
  [/Commander in Chief/, 'Comandante en Jefe'],
  [/Battles of Lexington and Concord/, 'Batallas de Lexington y Concord'],
  [/Christopher Columbus/, 'Cristóbal Colón'],
  
  // 문장 구조 패턴
  [/Esta es la fecha the/, 'Esta es la fecha en que la'],
  [/Esta es la fecha when/, 'Esta es la fecha en que'],
  [/Esta fue la/, 'Esta fue la'],
  [/Estos fueron/, 'Estos fueron'],
  [/Esta fecha/, 'Esta fecha']
];

let cleanupCount = 0;
let totalProcessed = 0;

console.log('🔧 혼재 패턴 정리 중...');

for (const question of spanishQuestions) {
  // 질문 정리
  const originalQuestion = question.question;
  let cleanedQuestion = question.question;
  
  for (const [pattern, replacement] of cleanupPatterns) {
    cleanedQuestion = cleanedQuestion.replace(pattern, replacement);
  }
  
  if (cleanedQuestion !== originalQuestion) {
    question.question = cleanedQuestion;
    cleanupCount++;
  }
  totalProcessed++;
  
  // 정답 정리
  for (const answer of question.correctAnswers) {
    // 정답 텍스트 정리
    const originalText = answer.text;
    let cleanedText = answer.text;
    
    for (const [pattern, replacement] of cleanupPatterns) {
      cleanedText = cleanedText.replace(pattern, replacement);
    }
    
    if (cleanedText !== originalText) {
      answer.text = cleanedText;
      cleanupCount++;
    }
    totalProcessed++;
    
    // 정답 설명 정리
    const originalRationale = answer.rationale;
    let cleanedRationale = answer.rationale;
    
    for (const [pattern, replacement] of cleanupPatterns) {
      cleanedRationale = cleanedRationale.replace(pattern, replacement);
    }
    
    if (cleanedRationale !== originalRationale) {
      answer.rationale = cleanedRationale;
      cleanupCount++;
    }
    totalProcessed++;
  }
  
  // 오답 정리
  for (const answer of question.wrongAnswers) {
    // 오답 텍스트 정리
    const originalText = answer.text;
    let cleanedText = answer.text;
    
    for (const [pattern, replacement] of cleanupPatterns) {
      cleanedText = cleanedText.replace(pattern, replacement);
    }
    
    if (cleanedText !== originalText) {
      answer.text = cleanedText;
      cleanupCount++;
    }
    totalProcessed++;
    
    // 오답 설명 정리
    const originalRationale = answer.rationale;
    let cleanedRationale = answer.rationale;
    
    for (const [pattern, replacement] of cleanupPatterns) {
      cleanedRationale = cleanedRationale.replace(pattern, replacement);
    }
    
    if (cleanedRationale !== originalRationale) {
      answer.rationale = cleanedRationale;
      cleanupCount++;
    }
    totalProcessed++;
  }
}

// 남은 [Traducción necesaria] 항목들 처리
console.log('🔧 남은 [Traducción necesaria] 항목 처리 중...');

const remainingTranslations = {
  "[Traducción necesaria] No one is above the law": "Nadie está por encima de la ley",
  "[Traducción necesaria] Leaders must obey the law": "Los líderes deben obedecer la ley",
  "[Traducción necesaria] Government must obey the law": "El gobierno debe obedecer la ley",
  "[Traducción necesaria] Everyone must follow the law": "Todos deben seguir la ley"
};

let remainingCount = 0;

for (const question of spanishQuestions) {
  // 정답에서 남은 [Traducción necesaria] 처리
  for (const answer of question.correctAnswers) {
    if (answer.text.includes('[Traducción necesaria]')) {
      for (const [original, translation] of Object.entries(remainingTranslations)) {
        if (answer.text === original) {
          answer.text = translation;
          remainingCount++;
          break;
        }
      }
    }
    
    if (answer.rationale.includes('[Traducción necesaria]')) {
      // 간단한 패턴 기반 번역
      let rationale = answer.rationale.replace('[Traducción necesaria] ', '');
      if (rationale.startsWith('This phrase best summarizes')) {
        answer.rationale = rationale.replace('This phrase best summarizes', 'Esta frase resume mejor');
        remainingCount++;
      } else if (rationale.startsWith('The government itself')) {
        answer.rationale = rationale.replace('The government itself is also bound by', 'El gobierno mismo también está sujeto a');
        remainingCount++;
      }
    }
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 최종 정리 완료!`);
console.log(`📊 정리 결과:`);
console.log(`  - 처리된 항목: ${totalProcessed}개`);
console.log(`  - 정리된 항목: ${cleanupCount}개`);
console.log(`  - 추가 번역: ${remainingCount}개`);

// 최종 상태 재확인
let finalRemaining = 0;
let sampleIssues = [];

for (const question of spanishQuestions) {
  // 질문 확인
  if (question.question.includes('[Traducción necesaria]') || 
      (question.question.includes('This ') || question.question.includes('The '))) {
    finalRemaining++;
    if (sampleIssues.length < 5) {
      sampleIssues.push(`질문 ${question.id}: ${question.question.substring(0, 50)}...`);
    }
  }
  
  // 정답 확인
  for (const answer of question.correctAnswers) {
    if (answer.text.includes('[Traducción necesaria]') || 
        answer.rationale.includes('[Traducción necesaria]') ||
        (answer.rationale.includes('This ') || answer.rationale.includes('The '))) {
      finalRemaining++;
      if (sampleIssues.length < 5) {
        sampleIssues.push(`질문 ${question.id} 정답: ${(answer.text + ' ' + answer.rationale).substring(0, 50)}...`);
      }
    }
  }
  
  // 오답 확인
  for (const answer of question.wrongAnswers) {
    if (answer.text.includes('[Traducción necesaria]') || 
        answer.rationale.includes('[Traducción necesaria]') ||
        (answer.rationale.includes('This ') || answer.rationale.includes('The '))) {
      finalRemaining++;
      if (sampleIssues.length < 5) {
        sampleIssues.push(`질문 ${question.id} 오답: ${(answer.text + ' ' + answer.rationale).substring(0, 50)}...`);
      }
    }
  }
}

console.log(`\n📈 최종 상태:`);
console.log(`  - 남은 미번역 항목: ${finalRemaining}개`);
console.log(`  - 최종 완료율: ${Math.round(((700 - finalRemaining) / 700) * 100)}%`);

if (sampleIssues.length > 0) {
  console.log(`\n🔍 남은 이슈 샘플:`);
  sampleIssues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
}

if (finalRemaining === 0) {
  console.log(`\n🎉 완벽! 스페인어 번역이 100% 완료되었습니다!`);
} else if (finalRemaining < 20) {
  console.log(`\n🎯 거의 완료! 남은 ${finalRemaining}개 항목만 수동 검토하면 됩니다.`);
} else {
  console.log(`\n📋 진전 있음! ${finalRemaining}개 항목이 추가 작업이 필요합니다.`);
}
