const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_precise_analysis.json', 'utf8'));

console.log('🇪🇸 스페인어 100% 달성 최종 작업...\n');
console.log(`🎯 목표: 남은 ${analysisResults.translationIssues.length}개 항목 완전 정리\n`);

// 남은 패턴들을 위한 최종 완성 사전
const finalPushTranslations = {
  // 완전한 문장 교체 (실제 분석 결과 기반)
  "The Speaker of la Cámara sucede a la presidencia only if both el Presidente and Vice President cannot serve.": "El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.",
  
  "The Secretary of Defense is the civilian head of el Departamento de Defensa, acting under el Presidente's authority.": "El Secretario de Defensa es el jefe civil del Departamento de Defensa, actuando bajo la autoridad del Presidente.",
  
  "The Speaker of la Cámara lidera el proceso for a bill to pass la Cámara, but does not sign bills into law.": "El Presidente de la Cámara lidera el proceso para que un proyecto de ley pase por la Cámara, pero no firma proyectos de ley para convertirlos en ley.",
  
  "The Supreme Court can rule a law unconstitutional after it is enacted, but it cannot prevent laws from being passed.": "El Tribunal Supremo puede declarar una ley inconstitucional después de que sea promulgada, pero no puede evitar que se aprueben leyes.",
  
  "The Cabinet, composed of the heads of executive departments, proporciona asesoramiento experto to el Presidente on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  
  "The Mayor is the head of a city government, different from el Gobernador who is the head of state government.": "El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "The President is the head of the federal government, different from el Gobernador who is the head of state government.": "El Presidente es el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "El typical deadline for filing taxes is 15 de abril. (It can be extended if it falls on a fin de semana o día festivo.)": "La fecha límite típica para presentar impuestos es el 15 de abril. (Se puede extender si cae en fin de semana o día festivo.)",
  
  "The main purpose of la Convención Constitucional was to create a new framework for government, replacing the Articles of Confederation.": "El propósito principal de la Convención Constitucional fue crear un nuevo marco para el gobierno, reemplazando los Artículos de la Confederación.",
  
  "The Federalist Papers supported the passage of la Constitución de EE.UU.. Name one of the writers.": "Los Documentos Federalistas apoyaron la aprobación de la Constitución de EE.UU. Nombra uno de los escritores.",
  
  // 역사 관련 문장들
  "The Louisiana Purchase nearly doubled the size of the Estados Unidos.": "La Compra de Luisiana casi duplicó el tamaño de Estados Unidos.",
  
  "The Guerra Civil (1861-1865) was the most significant war of the 1800s.": "La Guerra Civil (1861-1865) fue la guerra más significativa del siglo XIX.",
  
  "This war was fought between the Estados Unidos and Great Britain.": "Esta guerra se libró entre Estados Unidos y Gran Bretaña.",
  
  "This war (1846-1848) resulted en EE.UU. acquiring vast western territories.": "Esta guerra (1846-1848) resultó en que EE.UU. adquiriera vastos territorios occidentales.",
  
  "This war took place in 1898.": "Esta guerra tuvo lugar en 1898.",
  
  "During the war, he issued the Emancipation Proclamation, which freed slaves en la rebellious Southern states.": "Durante la guerra, emitió la Proclamación de Emancipación, que liberó a los esclavos en los estados sureños rebeldes.",
  
  "It freed slaves en la rebellious Southern states durante la Guerra Civil.": "Liberó a los esclavos en los estados sureños rebeldes durante la Guerra Civil.",
  
  "The Estados Unidos entered the war in 1917.": "Estados Unidos entró en la guerra en 1917.",
  
  "The Estados Unidos entered the war after the attack on Pearl Harbor in 1941.": "Estados Unidos entró en la guerra después del ataque a Pearl Harbor en 1941.",
  
  "This war began in 1950.": "Esta guerra comenzó en 1950."
};

// 고급 패턴 기반 최종 번역
function finalTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저
  if (finalPushTranslations[text]) {
    return finalPushTranslations[text];
  }
  
  let translated = text;
  
  // 최종 정리 패턴들
  const finalPatterns = [
    // 완전한 구문 교체
    [/The Speaker of la Cámara/g, 'El Presidente de la Cámara'],
    [/The Secretary of Defense is the civilian head of el Departamento de Defensa/g, 'El Secretario de Defensa es el jefe civil del Departamento de Defensa'],
    [/proporciona asesoramiento experto to el Presidente/g, 'proporciona asesoramiento experto al Presidente'],
    [/different from el Gobernador who is/g, 'diferente del Gobernador que es'],
    [/El typical deadline for filing taxes is 15 de abril/g, 'La fecha límite típica para presentar impuestos es el 15 de abril'],
    [/la Convención Constitucional was to create/g, 'la Convención Constitucional fue crear'],
    [/la Constitución de EE\.UU\.\./g, 'la Constitución de EE.UU.'],
    
    // 역사 관련
    [/The Louisiana Purchase nearly doubled the size of the Estados Unidos/g, 'La Compra de Luisiana casi duplicó el tamaño de Estados Unidos'],
    [/The Guerra Civil \(1861-1865\) was the most significant/g, 'La Guerra Civil (1861-1865) fue la más significativa'],
    [/This war was fought between the Estados Unidos and/g, 'Esta guerra se libró entre Estados Unidos y'],
    [/resulted en EE\.UU\. acquiring/g, 'resultó en que EE.UU. adquiriera'],
    [/freed slaves en la rebellious Southern states/g, 'liberó a los esclavos en los estados sureños rebeldes'],
    [/durante la Guerra Civil/g, 'durante la Guerra Civil'],
    [/The Estados Unidos entered the war/g, 'Estados Unidos entró en la guerra'],
    
    // 기본 패턴들
    [/\bel Presidente\b/g, 'el Presidente'],
    [/\bthe President\b/g, 'el Presidente'],
    [/\bel Gobernador\b/g, 'el Gobernador'],
    [/\bthe Governor\b/g, 'el Gobernador'],
    [/\bla Cámara\b/g, 'la Cámara'],
    [/\bthe House\b/g, 'la Cámara'],
    [/\bel Departamento de Defensa\b/g, 'el Departamento de Defensa'],
    [/\bthe Department of Defense\b/g, 'el Departamento de Defensa'],
    [/\bla Convención Constitucional\b/g, 'la Convención Constitucional'],
    [/\bthe Constitutional Convention\b/g, 'la Convención Constitucional'],
    [/\bla Constitución de EE\.UU\./g, 'la Constitución de EE.UU.'],
    [/\bthe U\.S\. Constitution\b/g, 'la Constitución de EE.UU.'],
    [/\bEstados Unidos\b/g, 'Estados Unidos'],
    [/\bUnited States\b/g, 'Estados Unidos'],
    [/\bEE\.UU\./g, 'EE.UU.'],
    [/\bU\.S\./g, 'EE.UU.'],
    
    // 동사 패턴
    [/\bsucede a la presidencia\b/g, 'sucede a la presidencia'],
    [/\bsucceeds to the presidency\b/g, 'sucede a la presidencia'],
    [/\blidera el proceso\b/g, 'lidera el proceso'],
    [/\bleads the process\b/g, 'lidera el proceso'],
    [/\bcan rule a law unconstitutional\b/g, 'puede declarar una ley inconstitucional'],
    [/\bcan be extended if it falls\b/g, 'se puede extender si cae'],
    [/\bwas fought between\b/g, 'se libró entre'],
    [/\bentered the war\b/g, 'entró en la guerra'],
    [/\bbegan in 1950\b/g, 'comenzó en 1950'],
    [/\btook place in 1898\b/g, 'tuvo lugar en 1898'],
    
    // 시간 및 장소
    [/\bin 1917\b/g, 'en 1917'],
    [/\bin 1941\b/g, 'en 1941'],
    [/\bin 1950\b/g, 'en 1950'],
    [/\bin 1898\b/g, 'en 1898'],
    [/\bfin de semana o día festivo\b/g, 'fin de semana o día festivo'],
    [/\bweekend or holiday\b/g, 'fin de semana o día festivo'],
    [/\b15 de abril\b/g, '15 de abril'],
    [/\bApril 15\b/g, '15 de abril']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of finalPatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let finalCompletedCount = 0;
let finalProcessedCount = 0;

console.log('🔧 최종 100% 달성 작업 진행 중...');

// 분석 결과의 각 이슈를 하나씩 정확히 처리
for (const issue of analysisResults.translationIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === issue.questionId);
  if (!spanishQ) continue;
  
  let wasCompleted = false;
  const originalText = issue.spanish;
  
  try {
    if (issue.type === 'question') {
      const translated = finalTranslate(issue.spanish);
      if (translated !== issue.spanish) {
        spanishQ.question = translated;
        wasCompleted = true;
      }
      
    } else if (issue.type === 'correctAnswer') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = finalTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'correctRationale') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = finalTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongAnswer') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = finalTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongRationale') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = finalTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
    }
    
    if (wasCompleted) {
      finalCompletedCount++;
      console.log(`  ✅ 질문 ${issue.questionId} ${issue.type}${issue.index !== undefined ? `[${issue.index}]` : ''} 최종 완성`);
    }
    
    finalProcessedCount++;
    
    if (finalProcessedCount % 15 === 0) {
      console.log(`  📊 진행률: ${finalProcessedCount}/${analysisResults.translationIssues.length} (${Math.round(finalProcessedCount/analysisResults.translationIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${issue.questionId} ${issue.type} 최종 처리 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 최종 100% 달성 작업 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 항목: ${finalProcessedCount}개`);
console.log(`  - 최종 완성: ${finalCompletedCount}개`);
console.log(`  - 최종 성공률: ${Math.round(finalCompletedCount/finalProcessedCount*100)}%`);

console.log(`\n🎯 다음 단계: 100% 달성 여부 최종 확인`);
