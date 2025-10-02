const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const translationTasks = JSON.parse(fs.readFileSync('./spanish_translation_tasks.json', 'utf8'));

console.log('🇪🇸 스페인어 확장 번역 작업 시작...\n');

// 추가 번역 사전 (더 많은 항목)
const extendedTranslations = {
  // 정부 구조 기본
  "What is the rule of law?": "¿Qué es el estado de derecho?",
  "Everyone must follow the law": "Todos deben seguir la ley",
  "Leaders must obey the law": "Los líderes deben obedecer la ley",
  "Government must obey the law": "El gobierno debe obedecer la ley",
  "No one is above the law": "Nadie está por encima de la ley",
  
  // 의회 관련
  "How many U.S. Senators are there?": "¿Cuántos senadores de EE.UU. hay?",
  "one hundred (100)": "cien (100)",
  "We elect a U.S. Senator for how many years?": "¿Por cuántos años elegimos a un senador de EE.UU.?",
  "six (6)": "seis (6)",
  "Who is one of your state's U.S. Senators now?": "¿Quién es uno de los senadores de EE.UU. de su estado ahora?",
  "Answers will vary": "Las respuestas variarán",
  
  // 하원 관련
  "The House of Representatives has how many voting members?": "¿Cuántos miembros con derecho a voto tiene la Cámara de Representantes?",
  "four hundred thirty-five (435)": "cuatrocientos treinta y cinco (435)",
  "We elect a U.S. Representative for how many years?": "¿Por cuántos años elegimos a un representante de EE.UU.?",
  "two (2)": "dos (2)",
  
  // 대통령 관련
  "In what month do we vote for President?": "¿En qué mes votamos por el Presidente?",
  "November": "noviembre",
  "What is the name of the President of the United States now?": "¿Cuál es el nombre del Presidente de Estados Unidos ahora?",
  "What is the name of the Vice President of the United States now?": "¿Cuál es el nombre del Vicepresidente de Estados Unidos ahora?",
  
  // 권리와 자유
  "What is one right or freedom from the First Amendment?": "¿Cuál es un derecho o libertad de la Primera Enmienda?",
  "speech": "expresión",
  "religion": "religión",
  "assembly": "reunión",
  "press": "prensa",
  "petition the government": "petición al gobierno",
  
  // 시민권과 의무
  "What is one responsibility that is only for United States citizens?": "¿Cuál es una responsabilidad que es solo para ciudadanos estadounidenses?",
  "serve on a jury": "servir en un jurado",
  "vote in a federal election": "votar en una elección federal",
  
  // 역사 관련
  "When was the Constitution written?": "¿Cuándo fue escrita la Constitución?",
  "1787": "1787",
  "The Federalist Papers supported the passage of the U.S. Constitution. Name one of the writers.": "Los Documentos Federalistas apoyaron la aprobación de la Constitución de EE.UU. Nombra uno de los escritores.",
  "James Madison": "James Madison",
  "Alexander Hamilton": "Alexander Hamilton",
  "John Jay": "John Jay",
  
  // 지리
  "Name one of the two longest rivers in the United States.": "Nombra uno de los dos ríos más largos de Estados Unidos.",
  "Missouri (River)": "Río Missouri",
  "Mississippi (River)": "Río Mississippi",
  
  // 설명문
  "The rule of law means that everyone, including government officials, must follow the law.": "El estado de derecho significa que todos, incluidos los funcionarios del gobierno, deben seguir la ley.",
  "There are 100 U.S. Senators, two from each state.": "Hay 100 senadores de EE.UU., dos de cada estado.",
  "U.S. Senators serve six-year terms.": "Los senadores de EE.UU. sirven términos de seis años.",
  "The House has 435 voting members, with representation based on state population.": "La Cámara tiene 435 miembros con derecho a voto, con representación basada en la población del estado.",
  "U.S. Representatives serve two-year terms.": "Los representantes de EE.UU. sirven términos de dos años.",
  "Presidential elections are held in November of even-numbered years.": "Las elecciones presidenciales se celebran en noviembre de los años pares.",
  "The First Amendment protects freedom of speech, religion, press, assembly, and petition.": "La Primera Enmienda protege la libertad de expresión, religión, prensa, reunión y petición.",
  "Only U.S. citizens can vote in federal elections and serve on juries.": "Solo los ciudadanos estadounidenses pueden votar en elecciones federales y servir en jurados.",
  "The Constitution was written in 1787 during the Constitutional Convention.": "La Constitución fue escrita en 1787 durante la Convención Constitucional."
};

function applyExtendedTranslation(originalText) {
  if (extendedTranslations[originalText]) {
    return extendedTranslations[originalText];
  }
  return originalText;
}

// 다음 100개 항목 번역 (51-150번째)
let translatedCount = 0;
const extendedTasks = translationTasks.slice(50, 150); // 100개 항목

console.log(`📋 ${extendedTasks.length}개 항목 번역 시작...`);

for (const task of extendedTasks) {
  const question = spanishQuestions.find(q => q.id === task.questionId);
  if (!question) continue;
  
  let wasTranslated = false;
  
  // 질문 번역
  if (task.type === 'question' && task.text === '[Traducción necesaria]') {
    const translated = applyExtendedTranslation(task.englishText);
    if (translated !== task.englishText) {
      question.question = translated;
      wasTranslated = true;
    }
  }
  
  // 정답 번역
  if (task.type === 'correctAnswer') {
    const correctAnswer = question.correctAnswers.find(a => a.text === '[Traducción necesaria]');
    if (correctAnswer) {
      const translated = applyExtendedTranslation(task.englishText);
      if (translated !== task.englishText) {
        correctAnswer.text = translated;
        wasTranslated = true;
      }
    }
  }
  
  // 오답 번역
  if (task.type === 'wrongAnswer') {
    const wrongAnswer = question.wrongAnswers.find(a => a.text === '[Traducción necesaria]');
    if (wrongAnswer) {
      const translated = applyExtendedTranslation(task.englishText);
      if (translated !== task.englishText) {
        wrongAnswer.text = translated;
        wasTranslated = true;
      }
    }
  }
  
  // 설명 번역
  if (task.type === 'rationale') {
    // 정답 설명
    for (const correctAnswer of question.correctAnswers) {
      if (correctAnswer.rationale === '[Traducción necesaria]') {
        const translated = applyExtendedTranslation(task.englishText);
        if (translated !== task.englishText) {
          correctAnswer.rationale = translated;
          wasTranslated = true;
          break;
        }
      }
    }
    
    // 오답 설명
    for (const wrongAnswer of question.wrongAnswers) {
      if (wrongAnswer.rationale === '[Traducción necesaria]') {
        const translated = applyExtendedTranslation(task.englishText);
        if (translated !== task.englishText) {
          wrongAnswer.rationale = translated;
          wasTranslated = true;
          break;
        }
      }
    }
  }
  
  if (wasTranslated) {
    translatedCount++;
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 확장 번역 완료!`);
console.log(`📊 번역 결과:`);
console.log(`  - 처리된 작업: ${extendedTasks.length}개`);
console.log(`  - 성공적으로 번역: ${translatedCount}개`);

// 현재 번역 상태 확인
let totalTranslated = 0;
let totalNeeded = 0;

for (const question of spanishQuestions) {
  // 질문 확인
  if (question.question !== '[Traducción necesaria]') totalTranslated++;
  else totalNeeded++;
  
  // 정답 확인
  for (const answer of question.correctAnswers) {
    if (answer.text !== '[Traducción necesaria]') totalTranslated++;
    else totalNeeded++;
    
    if (answer.rationale !== '[Traducción necesaria]') totalTranslated++;
    else totalNeeded++;
  }
  
  // 오답 확인
  for (const answer of question.wrongAnswers) {
    if (answer.text !== '[Traducción necesaria]') totalTranslated++;
    else totalNeeded++;
    
    if (answer.rationale !== '[Traducción necesaria]') totalTranslated++;
    else totalNeeded++;
  }
}

console.log(`\n📈 전체 번역 진행률:`);
console.log(`  - 번역 완료: ${totalTranslated}개`);
console.log(`  - 번역 필요: ${totalNeeded}개`);
console.log(`  - 완료율: ${Math.round((totalTranslated / (totalTranslated + totalNeeded)) * 100)}%`);

console.log(`\n🎯 다음 단계:`);
console.log(`1. 남은 번역 작업 계속 진행`);
console.log(`2. 전문 용어 및 고유명사 번역 검토`);
console.log(`3. 번역 품질 최종 검증`);
