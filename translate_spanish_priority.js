const fs = require('fs');

// 스페인어 파일과 번역 작업 목록 로드
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const translationTasks = JSON.parse(fs.readFileSync('./spanish_translation_tasks.json', 'utf8'));

console.log('🇪🇸 스페인어 우선순위 번역 작업 시작...\n');

// 우선순위 번역 사전
const priorityTranslations = {
  // 기본 질문 패턴
  "What is the supreme law of the land?": "¿Cuál es la ley suprema del país?",
  "What does the Constitution do?": "¿Qué hace la Constitución?",
  "The idea of self-government is in the first three words of the Constitution. What are these words?": "La idea del autogobierno está en las primeras tres palabras de la Constitución. ¿Cuáles son estas palabras?",
  "What is an amendment?": "¿Qué es una enmienda?",
  "What do we call the first ten amendments to the Constitution?": "¿Cómo llamamos a las primeras diez enmiendas de la Constitución?",
  "What is one right or freedom from the First Amendment?": "¿Cuál es un derecho o libertad de la Primera Enmienda?",
  "How many amendments does the Constitution have?": "¿Cuántas enmiendas tiene la Constitución?",
  "What did the Declaration of Independence do?": "¿Qué hizo la Declaración de Independencia?",
  "What are two rights in the Declaration of Independence?": "¿Cuáles son dos derechos en la Declaración de Independencia?",
  "What is freedom of religion?": "¿Qué es la libertad de religión?",
  
  // 정답 번역
  "the Constitution": "la Constitución",
  "sets up the government": "establece el gobierno",
  "defines the government": "define el gobierno", 
  "protects basic rights of Americans": "protege los derechos básicos de los estadounidenses",
  "We the People": "Nosotros el Pueblo",
  "a change (to the Constitution)": "un cambio (a la Constitución)",
  "an addition (to the Constitution)": "una adición (a la Constitución)",
  "the Bill of Rights": "la Carta de Derechos",
  "speech": "expresión",
  "religion": "religión",
  "assembly": "reunión",
  "press": "prensa",
  "petition the government": "petición al gobierno",
  "twenty-seven (27)": "veintisiete (27)",
  "announced our independence (from Great Britain)": "anunció nuestra independencia (de Gran Bretaña)",
  "declared our independence (from Great Britain)": "declaró nuestra independencia (de Gran Bretaña)",
  "said that the United States is free (from Great Britain)": "dijo que Estados Unidos es libre (de Gran Bretaña)",
  "life": "vida",
  "liberty": "libertad",
  "pursuit of happiness": "búsqueda de la felicidad",
  "You can practice any religion, or not practice a religion": "Puedes practicar cualquier religión, o no practicar una religión",
  
  // 설명 번역
  "The Constitution is the foundational, supreme law of the U.S. government.": "La Constitución es la ley fundamental y suprema del gobierno de EE.UU.",
  "The Constitution establishes the framework of government and protects individual rights.": "La Constitución establece el marco del gobierno y protege los derechos individuales.",
  "These opening words establish that government power comes from the people.": "Estas palabras iniciales establecen que el poder del gobierno proviene del pueblo.",
  "An amendment is a formal change or addition to the Constitution.": "Una enmienda es un cambio formal o adición a la Constitución.",
  "The first ten amendments are collectively known as the Bill of Rights.": "Las primeras diez enmiendas se conocen colectivamente como la Carta de Derechos.",
  "The First Amendment protects fundamental freedoms including speech, religion, press, assembly, and petition.": "La Primera Enmienda protege las libertades fundamentales incluyendo expresión, religión, prensa, reunión y petición.",
  "The Constitution has been amended 27 times since its ratification.": "La Constitución ha sido enmendada 27 veces desde su ratificación.",
  "The Declaration formally announced the colonies' independence from British rule.": "La Declaración anunció formalmente la independencia de las colonias del dominio británico.",
  "The Declaration formally declared the colonies' independence from British rule.": "La Declaración declaró formalmente la independencia de las colonias del dominio británico.",
  "These are among the unalienable rights mentioned in the Declaration of Independence.": "Estos están entre los derechos inalienables mencionados en la Declaración de Independencia.",
  "Life is one of the three unalienable rights listed in the Declaration of Independence.": "La vida es uno de los tres derechos inalienables listados en la Declaración de Independencia.",
  "Liberty is one of the three unalienable rights listed in the Declaration of Independence.": "La libertad es uno de los tres derechos inalienables listados en la Declaración de Independencia.",
  "The pursuit of happiness is one of the three unalienable rights listed in the Declaration of Independence.": "La búsqueda de la felicidad es uno de los tres derechos inalienables listados en la Declaración de Independencia.",
  "Everyone in the U.S. has the right to practice any religion or no religion.": "Todos en EE.UU. tienen el derecho de practicar cualquier religión o ninguna religión.",
  
  // 최신 정보
  "Donald J. Trump": "Donald J. Trump",
  "JD Vance": "JD Vance",
  "(As of July 2025)": "(A partir de julio de 2025)",
  "The Vice President succeeds to the presidency if the President can no longer serve.": "El Vicepresidente sucede a la presidencia si el Presidente ya no puede servir.",
  "The Speaker of the House is third in the line of presidential succession.": "El Presidente de la Cámara es tercero en la línea de sucesión presidencial.",
  "The President holds the ultimate authority over the U.S. armed forces as Commander in Chief.": "El Presidente tiene la autoridad suprema sobre las fuerzas armadas de EE.UU. como Comandante en Jefe.",
  "A bill passed by Congress must be signed by the President to become law.": "Un proyecto de ley aprobado por el Congreso debe ser firmado por el Presidente para convertirse en ley.",
  "The President has the power to veto bills passed by Congress.": "El Presidente tiene el poder de vetar proyectos de ley aprobados por el Congreso.",
  "What does the President's Cabinet do?": "¿Qué hace el Gabinete del Presidente?",
  "advises the President": "asesora al Presidente"
};

// 번역 적용 함수
function applyTranslation(originalText) {
  // 정확한 매칭 우선
  if (priorityTranslations[originalText]) {
    return priorityTranslations[originalText];
  }
  
  // 부분 매칭 시도
  for (const [english, spanish] of Object.entries(priorityTranslations)) {
    if (originalText.includes(english)) {
      return originalText.replace(english, spanish);
    }
  }
  
  return originalText;
}

// 우선순위 번역 적용 (처음 50개 항목)
let translatedCount = 0;
const priorityTasks = translationTasks.slice(0, 50);

priorityTasks.forEach(task => {
  const questionIndex = spanishQuestions.findIndex(q => q.id === task.id);
  if (questionIndex === -1) return;
  
  const question = spanishQuestions[questionIndex];
  const originalText = task.text;
  const translatedText = applyTranslation(originalText);
  
  if (translatedText !== originalText && !translatedText.includes('[Traducción necesaria]')) {
    if (task.type === 'question') {
      question.question = translatedText;
      translatedCount++;
    } else if (task.type === 'correctAnswer') {
      if (task.field === 'text') {
        question.correctAnswers[task.index].text = translatedText;
        translatedCount++;
      } else if (task.field === 'rationale') {
        question.correctAnswers[task.index].rationale = translatedText;
        translatedCount++;
      }
    }
  }
});

// 번역된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`✅ 우선순위 번역 완료!`);
console.log(`📊 번역 결과:`);
console.log(`  - 처리된 작업: ${priorityTasks.length}개`);
console.log(`  - 성공적으로 번역: ${translatedCount}개`);
console.log(`  - 남은 번역 작업: ${translationTasks.length - translatedCount}개`);

// 번역 검증
const verification = [];
spanishQuestions.slice(0, 10).forEach(q => {
  verification.push({
    id: q.id,
    question: q.question,
    hasTranslationNeeded: q.question.includes('[Traducción necesaria]') ||
                         q.correctAnswers.some(a => a.text.includes('[Traducción necesaria]') || 
                                                   a.rationale.includes('[Traducción necesaria]'))
  });
});

console.log('\n🔍 처음 10개 문제 번역 상태:');
verification.forEach(v => {
  const status = v.hasTranslationNeeded ? '❌ 번역 필요' : '✅ 번역 완료';
  console.log(`  문제 ${v.id}: ${status}`);
});

console.log('\n🎯 다음 단계:');
console.log('1. 남은 번역 작업 계속 진행');
console.log('2. 전문 용어 및 고유명사 번역 검토');
console.log('3. 번역 품질 최종 검증');
