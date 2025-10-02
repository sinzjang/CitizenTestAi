const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));

console.log('🇪🇸 스페인어 종합 번역 작업 시작...\n');

// 포괄적인 번역 사전
const comprehensiveTranslations = {
  // 기본 정부 구조
  "No one is above the law": "Nadie está por encima de la ley",
  "Leaders must obey the law": "Los líderes deben obedecer la ley", 
  "Government must obey the law": "El gobierno debe obedecer la ley",
  "Everyone must follow the law": "Todos deben seguir la ley",
  
  // 정부 부처
  "President (executive)": "Presidente (ejecutivo)",
  "the courts (judicial)": "los tribunales (judicial)",
  "Congress (legislative)": "Congreso (legislativo)",
  "Senate and House (of Representatives)": "Senado y Cámara (de Representantes)",
  "(U.S. or national) legislature": "(legislatura de EE.UU. o nacional)",
  
  // 숫자와 기간
  "one hundred (100)": "cien (100)",
  "four hundred thirty-five (435)": "cuatrocientos treinta y cinco (435)",
  "six (6)": "seis (6)",
  "two (2)": "dos (2)",
  "four (4)": "cuatro (4)",
  
  // 인구와 대표
  "(because) they have more people": "(porque) tienen más gente",
  "(because) some states have more people": "(porque) algunos estados tienen más gente",
  "the state's population": "la población del estado",
  
  // 날짜와 시간
  "July 4, 1776": "4 de julio de 1776",
  "November": "noviembre",
  "1787": "1787",
  
  // 인물
  "(Thomas) Jefferson": "(Thomas) Jefferson",
  "James Madison": "James Madison",
  "Alexander Hamilton": "Alexander Hamilton",
  "John Jay": "John Jay",
  "Benjamin Franklin": "Benjamin Franklin",
  "George Washington": "George Washington",
  "Abraham Lincoln": "Abraham Lincoln",
  
  // 문서와 법률
  "the Constitution": "la Constitución",
  "the Bill of Rights": "la Carta de Derechos",
  "the Declaration of Independence": "la Declaración de Independencia",
  "the Federalist Papers": "los Documentos Federalistas",
  
  // 권리와 자유
  "speech": "expresión",
  "religion": "religión", 
  "assembly": "reunión",
  "press": "prensa",
  "petition the government": "petición al gobierno",
  
  // 의무와 책임
  "serve on a jury": "servir en un jurado",
  "vote in a federal election": "votar en una elección federal",
  
  // 지리
  "Missouri (River)": "Río Missouri",
  "Mississippi (River)": "Río Mississippi",
  "Atlantic (Ocean)": "Océano Atlántico",
  "Pacific (Ocean)": "Océano Pacífico",
  
  // 주요 설명문 패턴
  "This phrase best summarizes": "Esta frase resume mejor",
  "The government itself is also bound by": "El gobierno mismo también está sujeto a",
  "States with larger populations get more": "Los estados con poblaciones más grandes obtienen más",
  "The number of representatives is directly related to": "El número de representantes está directamente relacionado con",
  "The Vice President succeeds to the presidency if": "El Vicepresidente sucede a la presidencia si",
  "The Speaker of the House succeeds to the presidency only if": "El Presidente de la Cámara sucede a la presidencia solo si",
  "The Chief Justice is not in the line of": "El Presidente del Tribunal Supremo no está en la línea de",
  "The Secretary of State is fourth in the line of": "El Secretario de Estado es cuarto en la línea de",
  "Thomas Jefferson was the principal author of": "Thomas Jefferson fue el autor principal de",
  "This date is celebrated as Independence Day in": "Esta fecha se celebra como el Día de la Independencia en",
  "This is the date the U.S. Constitution was signed": "Esta es la fecha en que se firmó la Constitución de EE.UU.",
  "This is the date Christopher Columbus arrived": "Esta es la fecha en que Cristóbal Colón llegó",
  "This is the date of the Battles of Lexington and Concord": "Esta es la fecha de las Batallas de Lexington y Concord"
};

// 더 스마트한 번역 함수
function translateText(text, isRationale = false) {
  if (!text || !text.includes('[Traducción necesaria]')) {
    return text;
  }
  
  // [Traducción necesaria] 제거
  let cleanText = text.replace('[Traducción necesaria] ', '').replace('[Traducción necesaria]', '').trim();
  
  // 직접 매칭 확인
  if (comprehensiveTranslations[cleanText]) {
    return comprehensiveTranslations[cleanText];
  }
  
  // 부분 매칭 및 패턴 기반 번역
  let translatedText = cleanText;
  
  // 일반적인 패턴들 번역
  translatedText = translatedText
    .replace(/United States/g, 'Estados Unidos')
    .replace(/U\.S\./g, 'EE.UU.')
    .replace(/President/g, 'Presidente')
    .replace(/Congress/g, 'Congreso')
    .replace(/Constitution/g, 'Constitución')
    .replace(/Supreme Court/g, 'Tribunal Supremo')
    .replace(/House of Representatives/g, 'Cámara de Representantes')
    .replace(/Senate/g, 'Senado')
    .replace(/Bill of Rights/g, 'Carta de Derechos')
    .replace(/Declaration of Independence/g, 'Declaración de Independencia')
    .replace(/Revolutionary War/g, 'Guerra Revolucionaria')
    .replace(/Civil War/g, 'Guerra Civil')
    .replace(/World War/g, 'Guerra Mundial')
    .replace(/Independence Day/g, 'Día de la Independencia')
    .replace(/Commander in Chief/g, 'Comandante en Jefe')
    .replace(/Continental Army/g, 'Ejército Continental')
    .replace(/Chief Justice/g, 'Presidente del Tribunal Supremo')
    .replace(/Speaker of the House/g, 'Presidente de la Cámara')
    .replace(/Secretary of State/g, 'Secretario de Estado')
    .replace(/Vice President/g, 'Vicepresidente');
  
  // 설명문의 경우 추가 패턴 처리
  if (isRationale) {
    translatedText = translatedText
      .replace(/^This is/, 'Esta es')
      .replace(/^This was/, 'Esta fue')
      .replace(/^This date/, 'Esta fecha')
      .replace(/^The /, 'El ')
      .replace(/^These /, 'Estos ')
      .replace(/ was the /, ' fue el ')
      .replace(/ is the /, ' es el ')
      .replace(/ are the /, ' son los ')
      .replace(/ during the /, ' durante la ')
      .replace(/ of the /, ' de la ')
      .replace(/ in the /, ' en la ')
      .replace(/ to the /, ' a la ')
      .replace(/ from the /, ' de la ');
  }
  
  return translatedText;
}

let translatedCount = 0;
let processedCount = 0;

console.log('📋 번역 작업 진행 중...');

// 모든 질문 처리
for (let i = 0; i < spanishQuestions.length; i++) {
  const spanishQ = spanishQuestions[i];
  const englishQ = englishQuestions[i];
  
  if (!englishQ || spanishQ.id !== englishQ.id) {
    console.log(`⚠️  질문 ${spanishQ.id}: 영어 버전과 ID 불일치`);
    continue;
  }
  
  // 정답 번역
  for (let j = 0; j < spanishQ.correctAnswers.length; j++) {
    const spanishAnswer = spanishQ.correctAnswers[j];
    const englishAnswer = englishQ.correctAnswers[j];
    
    if (spanishAnswer.text.includes('[Traducción necesaria]')) {
      const translated = translateText(spanishAnswer.text);
      if (translated !== spanishAnswer.text) {
        spanishAnswer.text = translated;
        translatedCount++;
      }
      processedCount++;
    }
    
    if (spanishAnswer.rationale.includes('[Traducción necesaria]') || 
        (spanishAnswer.rationale.includes('This ') || spanishAnswer.rationale.includes('The '))) {
      const translated = translateText(spanishAnswer.rationale, true);
      if (translated !== spanishAnswer.rationale) {
        spanishAnswer.rationale = translated;
        translatedCount++;
      }
      processedCount++;
    }
  }
  
  // 오답 설명 번역 (영어가 남아있는 경우)
  for (let j = 0; j < spanishQ.wrongAnswers.length; j++) {
    const spanishAnswer = spanishQ.wrongAnswers[j];
    
    if (spanishAnswer.rationale.includes('This ') || spanishAnswer.rationale.includes('The ')) {
      const translated = translateText(spanishAnswer.rationale, true);
      if (translated !== spanishAnswer.rationale) {
        spanishAnswer.rationale = translated;
        translatedCount++;
      }
      processedCount++;
    }
  }
  
  if ((i + 1) % 20 === 0) {
    console.log(`  진행률: ${i + 1}/100 질문 처리 완료`);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 종합 번역 완료!`);
console.log(`📊 번역 결과:`);
console.log(`  - 처리된 항목: ${processedCount}개`);
console.log(`  - 성공적으로 번역: ${translatedCount}개`);

// 번역 후 상태 재확인
let remainingUntranslated = 0;
for (const question of spanishQuestions) {
  for (const answer of question.correctAnswers) {
    if (answer.text.includes('[Traducción necesaria]')) remainingUntranslated++;
    if (answer.rationale.includes('[Traducción necesaria]') || 
        (answer.rationale.includes('This ') || answer.rationale.includes('The '))) remainingUntranslated++;
  }
  for (const answer of question.wrongAnswers) {
    if (answer.rationale.includes('This ') || answer.rationale.includes('The ')) remainingUntranslated++;
  }
}

console.log(`\n📈 번역 후 상태:`);
console.log(`  - 남은 미번역 항목: ${remainingUntranslated}개`);
console.log(`  - 예상 완료율: ${Math.round(((700 - remainingUntranslated) / 700) * 100)}%`);

console.log(`\n🎯 다음 단계:`);
if (remainingUntranslated > 0) {
  console.log(`1. 남은 ${remainingUntranslated}개 항목 수동 번역`);
  console.log(`2. 전문 용어 및 고유명사 검토`);
} else {
  console.log(`1. 번역 품질 최종 검증`);
}
console.log(`3. 앱에서 스페인어 표시 테스트`);
