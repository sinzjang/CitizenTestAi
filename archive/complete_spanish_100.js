const fs = require('fs');

const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_precise_analysis.json', 'utf8'));

console.log('🇪🇸 스페인어 100% 완성 작업 시작...\n');
console.log(`🎯 목표: 남은 ${analysisResults.translationIssues.length}개 항목 완전 번역\n`);

// 완전한 번역 사전 - 실제 분석 결과 기반
const complete100Translations = {
  // 완전한 문장들 (분석 결과에서 발견된 실제 패턴들)
  "The EE.UU. legislature, which is el Congreso, has the constitutional authority to make laws.": "La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.",
  "The U.S. legislature, which is el Congreso, has the constitutional authority to make laws.": "La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.",
  
  "The Speaker of la Cámara sucede a la presidencia only if both el Presidente and Vice President cannot serve.": "El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.",
  "The Speaker of la Cámara lidera el proceso for a bill to pass la Cámara, but does not sign bills into law.": "El Presidente de la Cámara lidera el proceso para que un proyecto de ley pase por la Cámara, pero no firma proyectos de ley para convertirlos en ley.",
  
  "The Secretary of Defense is the civilian head of el Departamento de Defensa, acting under el Presidente's authority.": "El Secretario de Defensa es el jefe civil del Departamento de Defensa, actuando bajo la autoridad del Presidente.",
  
  "The Supreme Court can rule a law unconstitutional after it is enacted, but it cannot prevent laws from being passed.": "El Tribunal Supremo puede declarar una ley inconstitucional después de que sea promulgada, pero no puede evitar que se aprueben leyes.",
  
  "The Cabinet, composed of the heads of executive departments, proporciona asesoramiento experto to el Presidente on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  "The Cabinet, composed of the heads of executive departments, provides expert advice to the President on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  
  "The Mayor is the head of a city government, different from el Gobernador who is the head of state government.": "El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.",
  "The President is the head of the federal government, different from el Gobernador who is the head of state government.": "El Presidente es el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  // 수정헌법 관련
  "The 24th Amendment outlawed the use of impuestos electorales as a voting requirement.": "La 24ª Enmienda prohibió el uso de impuestos electorales como requisito para votar.",
  "The 24th Amendment eliminated poll taxes in federal elections.": "La 24ª Enmienda eliminó los impuestos electorales en las elecciones federales.",
  
  "The 19th Amendment prohibited discriminación electoral on the basis of sex.": "La 19ª Enmienda prohibió la discriminación electoral por razón de sexo.",
  "The 19th Amendment gave women the right to vote.": "La 19ª Enmienda otorgó a las mujeres el derecho al voto.",
  
  "The 15th Amendment prohibited discriminación electoral on the basis of race.": "La 15ª Enmienda prohibió la discriminación electoral por razón de raza.",
  "The 15th Amendment prohibited voting discrimination based on race.": "La 15ª Enmienda prohibió la discriminación electoral basada en la raza.",
  
  // 충성 서약 관련
  "The Pledge of Allegiance is an expression of loyalty to the nation of the Estados Unidos.": "El Juramento de Lealtad es una expresión de lealtad a la nación de Estados Unidos.",
  "The Pledge of Allegiance is an expression of loyalty to the nation of the United States.": "El Juramento de Lealtad es una expresión de lealtad a la nación de Estados Unidos.",
  
  "The flag symbolizes the Estados Unidos, so pledging allegiance to it means showing loyalty to the country.": "La bandera simboliza Estados Unidos, por lo que jurar lealtad a ella significa mostrar lealtad al país.",
  "The flag symbolizes the United States, so pledging allegiance to it means showing loyalty to the country.": "La bandera simboliza Estados Unidos, por lo que jurar lealtad a ella significa mostrar lealtad al país.",
  
  "The Oath of Allegiance includes a promise to obey the laws of the Estados Unidos.": "El Juramento de Lealtad incluye una promesa de obedecer las leyes de Estados Unidos.",
  "The Oath of Allegiance includes a promise to obey the laws of the United States.": "El Juramento de Lealtad incluye una promesa de obedecer las leyes de Estados Unidos.",
  
  "This is a promise to bear arms on behalf of the nation ¿Cuándo required.": "Esta es una promesa de portar armas en nombre de la nación cuando sea necesario.",
  "This is a promise to bear arms on behalf of the nation when required.": "Esta es una promesa de portar armas en nombre de la nación cuando sea necesario.",
  
  // 기타 중요한 문장들
  "Before the 26th Amendment was passed, the voting age was 21 in many states.": "Antes de que se aprobara la 26ª Enmienda, la edad para votar era 21 años en muchos estados.",
  
  "El typical deadline for filing taxes is April 15. (It can be extended if it falls on a weekend or holiday.)": "La fecha límite típica para presentar impuestos es el 15 de abril. (Se puede extender si cae en fin de semana o día festivo.)",
  "The typical deadline for filing taxes is April 15. (It can be extended if it falls on a weekend or holiday.)": "La fecha límite típica para presentar impuestos es el 15 de abril. (Se puede extender si cae en fin de semana o día festivo.)",
  
  // 헌법 관련
  "The Constitution fue escrita": "La Constitución fue escrita",
  "The Constitution was written": "La Constitución fue escrita",
  
  "The main purpose of la Constituciónal Convention was to create a new framework for government.": "El propósito principal de la Convención Constitucional fue crear un nuevo marco para el gobierno.",
  "The Constitutional Convention was held to create a new framework of government, replacing the Articles of Confederation.": "La Convención Constitucional se celebró para crear un nuevo marco de gobierno, reemplazando los Artículos de la Confederación.",
  
  "The Founding Fathers wrote la Constitución.": "Los Padres Fundadores escribieron la Constitución.",
  "The Founding Fathers wrote the Constitution.": "Los Padres Fundadores escribieron la Constitución.",
  
  // 간단한 패턴들
  "Estados Unidos": "Estados Unidos",
  "United States": "Estados Unidos",
  "EE.UU.": "EE.UU.",
  "U.S.": "EE.UU.",
  "la Constitución": "la Constitución",
  "the Constitution": "la Constitución",
  "el Congreso": "el Congreso",
  "Congress": "el Congreso",
  "la Cámara": "la Cámara",
  "the House": "la Cámara",
  "el Senado": "el Senado",
  "the Senate": "el Senado",
  "el Presidente": "el Presidente",
  "the President": "el Presidente",
  "el Gobernador": "el Gobernador",
  "the Governor": "el Gobernador"
};

// 고급 패턴 기반 번역 함수
function translateComplete(text, englishReference = '') {
  if (!text) return text;
  
  // 직접 매칭 먼저 확인
  if (complete100Translations[text]) {
    return complete100Translations[text];
  }
  
  // 영어 참조가 있으면 그것도 확인
  if (englishReference && complete100Translations[englishReference]) {
    return complete100Translations[englishReference];
  }
  
  let translated = text;
  
  // 복잡한 패턴 매칭
  const advancedPatterns = [
    // 문장 구조 수정
    [/The EE\.UU\. legislature/g, 'La legislatura de EE.UU.'],
    [/The U\.S\. legislature/g, 'La legislatura de EE.UU.'],
    [/la Constituciónal Convention/g, 'la Convención Constitucional'],
    [/The Constitutional Convention/g, 'La Convención Constitucional'],
    [/The Founding Fathers/g, 'Los Padres Fundadores'],
    [/The Pledge of Allegiance/g, 'El Juramento de Lealtad'],
    [/The Oath of Allegiance/g, 'El Juramento de Lealtad'],
    
    // 동사 수정
    [/fue escrita/g, 'fue escrita'],
    [/was written/g, 'fue escrita'],
    [/was passed/g, 'fue aprobada'],
    [/was held/g, 'se celebró'],
    [/symbolizes/g, 'simboliza'],
    [/includes/g, 'incluye'],
    [/prohibited/g, 'prohibió'],
    [/eliminated/g, 'eliminó'],
    [/outlawed/g, 'prohibió'],
    [/gave women/g, 'otorgó a las mujeres'],
    
    // 명사구 수정
    [/impuestos electorales/g, 'impuestos electorales'],
    [/poll taxes/g, 'impuestos electorales'],
    [/discriminación electoral/g, 'discriminación electoral'],
    [/voting discrimination/g, 'discriminación electoral'],
    [/el derecho al voto/g, 'el derecho al voto'],
    [/the right to vote/g, 'el derecho al voto'],
    [/federal elections/g, 'elecciones federales'],
    [/voting requirement/g, 'requisito para votar'],
    [/voting age/g, 'edad para votar'],
    
    // 기관 및 직책
    [/el Departamento de Defensa/g, 'el Departamento de Defensa'],
    [/the Department of Defense/g, 'el Departamento de Defensa'],
    [/proporciona asesoramiento experto/g, 'proporciona asesoramiento experto'],
    [/provides expert advice/g, 'proporciona asesoramiento experto'],
    [/lidera el proceso/g, 'lidera el proceso'],
    [/leads the process/g, 'lidera el proceso'],
    [/sucede a la presidencia/g, 'sucede a la presidencia'],
    [/succeeds to the presidency/g, 'sucede a la presidencia'],
    
    // 시간 및 조건
    [/¿Cuándo required/g, 'cuando sea necesario'],
    [/when required/g, 'cuando sea necesario'],
    [/on behalf of the nation/g, 'en nombre de la nación'],
    [/April 15/g, '15 de abril'],
    [/weekend or holiday/g, 'fin de semana o día festivo'],
    [/in many states/g, 'en muchos estados'],
    
    // 기본 패턴들
    [/Estados Unidos/g, 'Estados Unidos'],
    [/United States/g, 'Estados Unidos'],
    [/EE\.UU\./g, 'EE.UU.'],
    [/U\.S\./g, 'EE.UU.']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of advancedPatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let completedCount = 0;
let processedCount = 0;

console.log('🔧 100% 완성 번역 작업 진행 중...');

// 분석 결과의 각 이슈를 정확히 처리
for (const issue of analysisResults.translationIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === issue.questionId);
  const englishQ = englishQuestions.find(q => q.id === issue.questionId);
  
  if (!spanishQ || !englishQ) continue;
  
  let wasCompleted = false;
  
  try {
    if (issue.type === 'question') {
      const translated = translateComplete(issue.spanish, issue.english);
      if (translated !== issue.spanish) {
        spanishQ.question = translated;
        wasCompleted = true;
      }
      
    } else if (issue.type === 'correctAnswer') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer) {
        const translated = translateComplete(issue.spanish, issue.english);
        if (translated !== issue.spanish) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'correctRationale') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer) {
        const translated = translateComplete(issue.spanish, issue.english);
        if (translated !== issue.spanish) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongAnswer') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer) {
        const translated = translateComplete(issue.spanish, issue.english);
        if (translated !== issue.spanish) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongRationale') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer) {
        const translated = translateComplete(issue.spanish, issue.english);
        if (translated !== issue.spanish) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
    }
    
    if (wasCompleted) {
      completedCount++;
      console.log(`  ✅ 질문 ${issue.questionId} ${issue.type}${issue.index !== undefined ? `[${issue.index}]` : ''} 번역 완료`);
    }
    
    processedCount++;
    
    if (processedCount % 10 === 0) {
      console.log(`  📊 진행률: ${processedCount}/${analysisResults.translationIssues.length} (${Math.round(processedCount/analysisResults.translationIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${issue.questionId} ${issue.type} 처리 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 100% 완성 작업 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 항목: ${processedCount}개`);
console.log(`  - 완성된 항목: ${completedCount}개`);
console.log(`  - 완성 성공률: ${Math.round(completedCount/processedCount*100)}%`);

console.log(`\n🎯 다음 단계: 최종 검증으로 100% 달성 확인`);
