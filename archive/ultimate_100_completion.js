const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_precise_analysis.json', 'utf8'));

console.log('🇪🇸 스페인어 100% 완전 달성 최종 작업...\n');
console.log(`🎯 목표: 남은 ${analysisResults.translationIssues.length}개 항목 완전 정리\n`);

// 실제 분석 결과에서 발견된 혼재 패턴들을 위한 완전 정리 사전
const ultimateTranslations = {
  // 완전한 문장 교체 (실제 분석 결과 기반)
  "The Supreme Court puede declarar una ley inconstitucional after it is enacted, but it cannot prevent laws from being passed.": "El Tribunal Supremo puede declarar una ley inconstitucional después de que sea promulgada, pero no puede evitar que se aprueben leyes.",
  
  "The Cabinet, composed of the heads of executive departments, proporciona asesoramiento experto to el Presidente on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  
  "The Mayor is the head of a city government, diferente del Gobernador que es the head of state government.": "El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "The President is the head of the federal government, diferente del Gobernador que es the head of state government.": "El Presidente es el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "La fecha límite típica para presentar impuestos es el 15 de abril. (It se puede extender if it falls on a fin de semana o día festivo.)": "La fecha límite típica para presentar impuestos es el 15 de abril. (Se puede extender si cae en fin de semana o día festivo.)",
  
  "The main purpose of la Convención Constitucional fue crear a new framework for government, replacing the Articles of Confederation.": "El propósito principal de la Convención Constitucional fue crear un nuevo marco para el gobierno, reemplazando los Artículos de la Confederación.",
  
  "During the war, he issued the Emancipation Proclamation, which freed slaves en la rebellious Southern states.": "Durante la guerra, emitió la Proclamación de Emancipación, que liberó a los esclavos en los estados sureños rebeldes.",
  
  "This war took place durante la 1960s and 1970s.": "Esta guerra tuvo lugar durante las décadas de 1960 y 1970.",
  
  "This war took place in 1991.": "Esta guerra tuvo lugar en 1991.",
  
  "Before he was President, Eisenhower was a general. What war was he in?": "Antes de ser Presidente, Eisenhower era general. ¿En qué guerra participó?",
  
  "The Guerra Civil occurred before Eisenhower was born.": "La Guerra Civil ocurrió antes de que naciera Eisenhower.",
  
  "The Vietnam War escalated after Eisenhower's presidency.": "La Guerra de Vietnam se intensificó después de la presidencia de Eisenhower.",
  
  "During the Cold War, what was the main concern of the Estados Unidos?": "Durante la Guerra Fría, ¿cuál era la principal preocupación de Estados Unidos?",
  
  "After Guerra Mundial II, the main focus of EE.UU. foreign policy was containing the spread of communism.": "Después de la Segunda Guerra Mundial, el enfoque principal de la política exterior de EE.UU. fue contener la expansión del comunismo.",
  
  "The Great Depression": "La Gran Depresión",
  
  "The Great Depression was the main issue of the 1930s, before the Cold War.": "La Gran Depresión fue el problema principal de la década de 1930, antes de la Guerra Fría.",
  
  "The temperance movement was a social movement to prohibit the consumption of alcohol.": "El movimiento de templanza fue un movimiento social para prohibir el consumo de alcohol.",
  
  "The women's suffrage movement was focused on gaining el derecho al voto for women.": "El movimiento por el sufragio femenino se enfocó en obtener el derecho al voto para las mujeres.",
  
  "The anti-war movement was focused on opposition to a specific war, particularly the Vietnam War.": "El movimiento antibélico se enfocó en la oposición a una guerra específica, particularmente la Guerra de Vietnam.",
  
  "The attack on Pearl Harbor happened on December 7, 1941, leading to EE.UU. entry into World War II.": "El ataque a Pearl Harbor ocurrió el 7 de diciembre de 1941, llevando a la entrada de EE.UU. en la Segunda Guerra Mundial."
};

// 고급 패턴 기반 완전 번역
function ultimateTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저
  if (ultimateTranslations[text]) {
    return ultimateTranslations[text];
  }
  
  let translated = text;
  
  // 완전 정리 패턴들 (실제 분석 결과 기반)
  const ultimatePatterns = [
    // 완전한 구문 교체
    [/puede declarar una ley inconstitucional after it is enacted/g, 'puede declarar una ley inconstitucional después de que sea promulgada'],
    [/proporciona asesoramiento experto to el Presidente/g, 'proporciona asesoramiento experto al Presidente'],
    [/diferente del Gobernador que es the head of/g, 'diferente del Gobernador que es el jefe del'],
    [/It se puede extender if it falls on a/g, 'Se puede extender si cae en'],
    [/la Convención Constitucional fue crear a new framework/g, 'la Convención Constitucional fue crear un nuevo marco'],
    [/freed slaves en la rebellious Southern states/g, 'liberó a los esclavos en los estados sureños rebeldes'],
    [/took place durante la 1960s and 1970s/g, 'tuvo lugar durante las décadas de 1960 y 1970'],
    [/the main concern of the Estados Unidos/g, 'la principal preocupación de Estados Unidos'],
    [/After Guerra Mundial II, the main focus of EE\.UU\./g, 'Después de la Segunda Guerra Mundial, el enfoque principal de EE.UU.'],
    [/gaining el derecho al voto for women/g, 'obtener el derecho al voto para las mujeres'],
    [/leading to EE\.UU\. entry into/g, 'llevando a la entrada de EE.UU. en'],
    
    // 기본 혼재 패턴 정리
    [/\bafter it is enacted\b/g, 'después de que sea promulgada'],
    [/\bbut it cannot prevent\b/g, 'pero no puede evitar'],
    [/\bto el Presidente\b/g, 'al Presidente'],
    [/\bthe head of state government\b/g, 'el jefe del gobierno estatal'],
    [/\bthe head of the federal government\b/g, 'el jefe del gobierno federal'],
    [/\bthe head of a city government\b/g, 'el jefe de un gobierno municipal'],
    [/\bif it falls on a\b/g, 'si cae en'],
    [/\ba new framework for government\b/g, 'un nuevo marco para el gobierno'],
    [/\breplacing the Articles of Confederation\b/g, 'reemplazando los Artículos de la Confederación'],
    [/\bwhich freed slaves\b/g, 'que liberó a los esclavos'],
    [/\bin the rebellious Southern states\b/g, 'en los estados sureños rebeldes'],
    [/\bduring the 1960s and 1970s\b/g, 'durante las décadas de 1960 y 1970'],
    [/\bBefore he was President\b/g, 'Antes de ser Presidente'],
    [/\bwas a general\b/g, 'era general'],
    [/\bWhat war was he in\b/g, '¿En qué guerra participó'],
    [/\boccurred before Eisenhower was born\b/g, 'ocurrió antes de que naciera Eisenhower'],
    [/\bescalated after Eisenhower's presidency\b/g, 'se intensificó después de la presidencia de Eisenhower'],
    [/\bwhat was the main concern\b/g, '¿cuál era la principal preocupación'],
    [/\bthe main focus of\b/g, 'el enfoque principal de'],
    [/\bwas containing the spread of communism\b/g, 'fue contener la expansión del comunismo'],
    [/\bwas the main issue of the 1930s\b/g, 'fue el problema principal de la década de 1930'],
    [/\bbefore the Cold War\b/g, 'antes de la Guerra Fría'],
    [/\bto prohibit the consumption of alcohol\b/g, 'para prohibir el consumo de alcohol'],
    [/\bwas focused on gaining\b/g, 'se enfocó en obtener'],
    [/\bfor women\b/g, 'para las mujeres'],
    [/\bwas focused on opposition to\b/g, 'se enfocó en la oposición a'],
    [/\ba specific war\b/g, 'una guerra específica'],
    [/\bparticularly the Vietnam War\b/g, 'particularmente la Guerra de Vietnam'],
    [/\bhappened on December 7, 1941\b/g, 'ocurrió el 7 de diciembre de 1941'],
    [/\bleading to\b/g, 'llevando a'],
    [/\bentry into World War II\b/g, 'entrada en la Segunda Guerra Mundial'],
    
    // 기본 용어 정리
    [/\bthe Supreme Court\b/g, 'el Tribunal Supremo'],
    [/\bthe Cabinet\b/g, 'el Gabinete'],
    [/\bthe Mayor\b/g, 'el Alcalde'],
    [/\bthe President\b/g, 'el Presidente'],
    [/\bthe Governor\b/g, 'el Gobernador'],
    [/\bthe Constitutional Convention\b/g, 'la Convención Constitucional'],
    [/\bthe Emancipation Proclamation\b/g, 'la Proclamación de Emancipación'],
    [/\bthe Civil War\b/g, 'la Guerra Civil'],
    [/\bthe Vietnam War\b/g, 'la Guerra de Vietnam'],
    [/\bthe Cold War\b/g, 'la Guerra Fría'],
    [/\bWorld War II\b/g, 'la Segunda Guerra Mundial'],
    [/\bthe Great Depression\b/g, 'la Gran Depresión'],
    [/\bthe temperance movement\b/g, 'el movimiento de templanza'],
    [/\bthe women's suffrage movement\b/g, 'el movimiento por el sufragio femenino'],
    [/\bthe anti-war movement\b/g, 'el movimiento antibélico'],
    [/\bPearl Harbor\b/g, 'Pearl Harbor'],
    [/\bUnited States\b/g, 'Estados Unidos'],
    [/\bU\.S\./g, 'EE.UU.'],
    
    // 시간 표현
    [/\b1960s and 1970s\b/g, 'décadas de 1960 y 1970'],
    [/\bDecember 7, 1941\b/g, '7 de diciembre de 1941'],
    [/\bthe 1930s\b/g, 'la década de 1930'],
    
    // 기타 표현
    [/\bApril 15\b/g, '15 de abril'],
    [/\bweekend or holiday\b/g, 'fin de semana o día festivo'],
    [/\bthe right to vote\b/g, 'el derecho al voto']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of ultimatePatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let ultimateCompletedCount = 0;
let ultimateProcessedCount = 0;

console.log('🔧 완전 100% 달성 작업 진행 중...');

// 분석 결과의 각 이슈를 하나씩 정확히 처리
for (const issue of analysisResults.translationIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === issue.questionId);
  if (!spanishQ) continue;
  
  let wasCompleted = false;
  const originalText = issue.spanish;
  
  try {
    if (issue.type === 'question') {
      const translated = ultimateTranslate(issue.spanish);
      if (translated !== issue.spanish) {
        spanishQ.question = translated;
        wasCompleted = true;
      }
      
    } else if (issue.type === 'correctAnswer') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = ultimateTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'correctRationale') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = ultimateTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongAnswer') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = ultimateTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongRationale') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = ultimateTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
    }
    
    if (wasCompleted) {
      ultimateCompletedCount++;
      console.log(`  ✅ 질문 ${issue.questionId} ${issue.type}${issue.index !== undefined ? `[${issue.index}]` : ''} 완전 완성`);
    }
    
    ultimateProcessedCount++;
    
    if (ultimateProcessedCount % 15 === 0) {
      console.log(`  📊 진행률: ${ultimateProcessedCount}/${analysisResults.translationIssues.length} (${Math.round(ultimateProcessedCount/analysisResults.translationIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${issue.questionId} ${issue.type} 완전 처리 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 완전 100% 달성 작업 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 항목: ${ultimateProcessedCount}개`);
console.log(`  - 완전 완성: ${ultimateCompletedCount}개`);
console.log(`  - 완전 성공률: ${Math.round(ultimateCompletedCount/ultimateProcessedCount*100)}%`);

console.log(`\n🎯 다음 단계: 100% 달성 여부 최종 확인`);
