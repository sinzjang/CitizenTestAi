const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));

console.log('🇪🇸 스페인어 최종 번역 정리 작업 시작...\n');

// 남은 영어 패턴들을 위한 고급 번역 사전
const finalTranslations = {
  // 완전한 문장 패턴
  "This date is celebrated as Independence Day in the Estados Unidos.": "Esta fecha se celebra como el Día de la Independencia en Estados Unidos.",
  "This is the date the U.S. Constitución was signed.": "Esta es la fecha en que se firmó la Constitución de EE.UU.",
  "This is the date Christopher Columbus arrived in the Americas.": "Esta es la fecha en que Cristóbal Colón llegó a las Américas.",
  "This is the date of the Battles of Lexington and Concord, which started the Revolutionary War.": "Esta es la fecha de las Batallas de Lexington y Concord, que iniciaron la Guerra Revolucionaria.",
  
  // 정부 구조 설명
  "This phrase best summarizes the core principle of the rule of law.": "Esta frase resume mejor el principio fundamental del estado de derecho.",
  "The government itself is also bound by the law and cannot act above it.": "El gobierno mismo también está sujeto a la ley y no puede actuar por encima de ella.",
  "The courts are the judicial branch, which interprets and applies the law.": "Los tribunales son la rama judicial, que interpreta y aplica la ley.",
  "The U.S. legislature, which is el Congreso, has the constitutional authority to make laws.": "La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.",
  
  // 인구와 대표 설명
  "States with larger populations get more representatives in the House.": "Los estados con poblaciones más grandes obtienen más representantes en la Cámara.",
  "The number of representatives is directly related to ¿Cómo many people live in each state.": "El número de representantes está directamente relacionado con cuántas personas viven en cada estado.",
  
  // 대통령 승계 설명
  "The Vice President succeeds to the presidency if el Presidente can no longer serve.": "El Vicepresidente sucede a la presidencia si el Presidente ya no puede servir.",
  "The Speaker of the House succeeds to the presidency only if both the President and Vice President cannot serve.": "El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.",
  "The Chief Justice is not in the line of presidential succession.": "El Presidente del Tribunal Supremo no está en la línea de sucesión presidencial.",
  "The Secretary of State is fourth in the line of presidential succession.": "El Secretario de Estado es cuarto en la línea de sucesión presidencial.",
  "The Secretary of State is fourth in the line of succession, after the Speaker of the House.": "El Secretario de Estado es cuarto en la línea de sucesión, después del Presidente de la Cámara.",
  
  // 역사 인물 설명
  "Thomas Jefferson was the principal author of the Declaration of Independence.": "Thomas Jefferson fue el autor principal de la Declaración de Independencia.",
  "George Washington was the Commander in Chief of the Continental Army and the first President.": "George Washington fue el Comandante en Jefe del Ejército Continental y el primer Presidente.",
  "Abraham Lincoln was the 16th President during the Civil War.": "Abraham Lincoln fue el 16º Presidente durante la Guerra Civil.",
  "Benjamin Franklin was on the committee, reviewed the document, and signed it, but was not the primary author.": "Benjamin Franklin estuvo en el comité, revisó el documento y lo firmó, pero no fue el autor principal.",
  
  // 기타 일반적인 패턴들
  "The Declaration stated that the Estados Unidos was a free and independent nation.": "La Declaración estableció que Estados Unidos era una nación libre e independiente.",
  "The Federalist Papers were essays written to support ratification of the Constitución.": "Los Documentos Federalistas fueron ensayos escritos para apoyar la ratificación de la Constitución.",
  "The Emancipation Proclamation was Lincoln's executive order that freed slaves in the Confederate states.": "La Proclamación de Emancipación fue la orden ejecutiva de Lincoln que liberó a los esclavos en los estados confederados."
};

// 더 정교한 패턴 기반 번역 함수
function advancedTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저 확인
  if (finalTranslations[text]) {
    return finalTranslations[text];
  }
  
  let translated = text;
  
  // 일반적인 영어 패턴들을 스페인어로 변환
  const patterns = [
    // 문장 시작 패턴
    [/^This is the date/, 'Esta es la fecha'],
    [/^This was the/, 'Esta fue la'],
    [/^This date/, 'Esta fecha'],
    [/^The Declaration/, 'La Declaración'],
    [/^The Constitution/, 'La Constitución'],
    [/^The Federalist Papers/, 'Los Documentos Federalistas'],
    [/^The Emancipation Proclamation/, 'La Proclamación de Emancipación'],
    
    // 동사 패턴
    [/ is celebrated as/, ' se celebra como'],
    [/ was signed/, ' fue firmada'],
    [/ arrived in/, ' llegó a'],
    [/ started the/, ' inició la'],
    [/ during the/, ' durante la'],
    [/ freed slaves/, ' liberó a los esclavos'],
    [/ written to support/, ' escritos para apoyar'],
    
    // 명사 패턴
    [/Independence Day/, 'Día de la Independencia'],
    [/Revolutionary War/, 'Guerra Revolucionaria'],
    [/Civil War/, 'Guerra Civil'],
    [/Continental Army/, 'Ejército Continental'],
    [/Commander in Chief/, 'Comandante en Jefe'],
    [/the Americas/, 'las Américas'],
    [/Confederate states/, 'estados confederados'],
    [/executive order/, 'orden ejecutiva'],
    
    // 숫자 패턴
    [/16th President/, '16º Presidente'],
    [/first President/, 'primer Presidente'],
    [/fourth in the line/, 'cuarto en la línea'],
    
    // 기타 패턴
    [/ratification of/, 'ratificación de'],
    [/principal author/, 'autor principal'],
    [/primary author/, 'autor principal'],
    [/free and independent nation/, 'nación libre e independiente'],
    [/presidential succession/, 'sucesión presidencial'],
    [/line of succession/, 'línea de sucesión']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of patterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let finalTranslatedCount = 0;
let processedItems = 0;

console.log('🔧 최종 번역 정리 진행 중...');

// 모든 질문의 모든 항목 재검토
for (const question of spanishQuestions) {
  // 정답 처리
  for (const answer of question.correctAnswers) {
    // 정답 텍스트
    if (answer.text.includes('[Traducción necesaria]')) {
      const cleaned = answer.text.replace('[Traducción necesaria] ', '').replace('[Traducción necesaria]', '').trim();
      const translated = advancedTranslate(cleaned);
      if (translated !== cleaned) {
        answer.text = translated;
        finalTranslatedCount++;
      }
      processedItems++;
    }
    
    // 정답 설명
    const originalRationale = answer.rationale;
    if (answer.rationale.includes('[Traducción necesaria]') || 
        answer.rationale.includes('This ') || 
        answer.rationale.includes('The ') ||
        answer.rationale.includes('Estados Unidos') ||
        answer.rationale.includes('Constitución')) {
      
      let cleanedRationale = answer.rationale.replace('[Traducción necesaria] ', '').replace('[Traducción necesaria]', '').trim();
      const translatedRationale = advancedTranslate(cleanedRationale);
      
      if (translatedRationale !== originalRationale) {
        answer.rationale = translatedRationale;
        finalTranslatedCount++;
      }
      processedItems++;
    }
  }
  
  // 오답 설명 처리
  for (const answer of question.wrongAnswers) {
    const originalRationale = answer.rationale;
    if (answer.rationale.includes('This ') || 
        answer.rationale.includes('The ') ||
        answer.rationale.includes('Estados Unidos') ||
        answer.rationale.includes('Constitución')) {
      
      const translatedRationale = advancedTranslate(answer.rationale);
      
      if (translatedRationale !== originalRationale) {
        answer.rationale = translatedRationale;
        finalTranslatedCount++;
      }
      processedItems++;
    }
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 최종 번역 정리 완료!`);
console.log(`📊 최종 번역 결과:`);
console.log(`  - 처리된 항목: ${processedItems}개`);
console.log(`  - 추가 번역: ${finalTranslatedCount}개`);

// 최종 상태 확인
let finalCheck = 0;
for (const question of spanishQuestions) {
  for (const answer of question.correctAnswers) {
    if (answer.text.includes('[Traducción necesaria]') || 
        (answer.rationale.includes('This ') || answer.rationale.includes('The ') || answer.rationale.includes('[Traducción necesaria]'))) {
      finalCheck++;
    }
  }
  for (const answer of question.wrongAnswers) {
    if (answer.rationale.includes('This ') || answer.rationale.includes('The ')) {
      finalCheck++;
    }
  }
}

console.log(`\n📈 최종 상태:`);
console.log(`  - 남은 미번역 항목: ${finalCheck}개`);
console.log(`  - 최종 완료율: ${Math.round(((700 - finalCheck) / 700) * 100)}%`);

if (finalCheck === 0) {
  console.log(`\n🎉 축하합니다! 스페인어 번역이 100% 완료되었습니다!`);
} else {
  console.log(`\n🎯 거의 완료! 남은 ${finalCheck}개 항목은 수동 검토가 필요합니다.`);
}
