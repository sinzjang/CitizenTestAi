const fs = require('fs');

const englishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_en.json', 'utf8'));
const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_precise_analysis.json', 'utf8'));

console.log('🇪🇸 체계적 스페인어 번역 작업 시작...\n');
console.log(`📋 총 ${analysisResults.translationIssues.length}개 항목 번역 예정\n`);

// 포괄적인 번역 사전
const systematicTranslations = {
  // 완전한 문장들
  "This phrase best summarizes the core principle de la rule of law.": "Esta frase resume mejor el principio fundamental del estado de derecho.",
  "This phrase best summarizes the core principle of the rule of law.": "Esta frase resume mejor el principio fundamental del estado de derecho.",
  "The U.S. legislature, which is el Congreso, has the constitutional authority to make laws.": "La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.",
  "The U.S. legislature, which is Congress, has the constitutional authority to make laws.": "La legislatura de EE.UU., que es el Congreso, tiene la autoridad constitucional para hacer leyes.",
  
  // 정부 기관과 직책
  "The name of el Presidente": "El nombre del Presidente",
  "The name of the President": "El nombre del Presidente",
  "The name of the Senator": "El nombre del Senador",
  "The name of the Mayor": "El nombre del Alcalde",
  
  // 의회 관련
  "The Speaker of la Cámara succeeds to the presidency only if both el Presidente and Vice President cannot serve.": "El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.",
  "The Speaker of the House succeeds to the presidency only if both the President and Vice President cannot serve.": "El Presidente de la Cámara sucede a la presidencia solo si tanto el Presidente como el Vicepresidente no pueden servir.",
  
  "The President pro tempore of el Senado is fourth in line, after el Presidente of la Cámara.": "El Presidente pro tempore del Senado es cuarto en la línea, después del Presidente de la Cámara.",
  "The President pro tempore of the Senate is fourth in line, after the Speaker of the House.": "El Presidente pro tempore del Senado es cuarto en la línea, después del Presidente de la Cámara.",
  
  // 국방 관련
  "The Secretary of Defense is the civilian head of the Department of Defense, acting under the President's authority.": "El Secretario de Defensa es el jefe civil del Departamento de Defensa, actuando bajo la autoridad del Presidente.",
  "The Chairman of the Joint Chiefs of Staff is the highest-ranking military officer but serves in an advisory role.": "El Presidente del Estado Mayor Conjunto es el oficial militar de más alto rango pero sirve en un papel asesor.",
  "The Vice President does not have direct command authority over the military.": "El Vicepresidente no tiene autoridad de mando directo sobre el ejército.",
  
  // 입법 과정
  "The Speaker of la Cámara leads the process for a bill to pass la Cámara, but does not sign bills into law.": "El Presidente de la Cámara lidera el proceso para que un proyecto de ley pase por la Cámara, pero no firma proyectos de ley para convertirlos en ley.",
  "The Speaker of the House leads the process for a bill to pass the House, but does not sign bills into law.": "El Presidente de la Cámara lidera el proceso para que un proyecto de ley pase por la Cámara, pero no firma proyectos de ley para convertirlos en ley.",
  
  "The Vice President can cast a tie-breaking vote in el Senado but does not sign bills into law.": "El Vicepresidente puede emitir un voto de desempate en el Senado pero no firma proyectos de ley para convertirlos en ley.",
  "The Vice President can cast a tie-breaking vote in the Senate but does not sign bills into law.": "El Vicepresidente puede emitir un voto de desempate en el Senado pero no firma proyectos de ley para convertirlos en ley.",
  
  "The Chief Justice interprets laws and is not involved in the legislative process.": "El Presidente del Tribunal Supremo interpreta las leyes y no está involucrado en el proceso legislativo.",
  
  // 사법부
  "The Supreme Court can rule a law unconstitutional after it is enacted, but it cannot prevent laws from being passed.": "El Tribunal Supremo puede declarar una ley inconstitucional después de que sea promulgada, pero no puede evitar que se aprueben leyes.",
  "It resolves legal disputes by making rulings.": "Resuelve disputas legales mediante fallos.",
  "The International Court of Justice is a UN judicial body that handles disputes between nations, not U.S. domestic cases.": "La Corte Internacional de Justicia es un órgano judicial de la ONU que maneja disputas entre naciones, no casos domésticos de EE.UU.",
  "The number of justices is set by law and has been nine since 1869.": "El número de jueces está establecido por ley y ha sido nueve desde 1869.",
  
  // 행정부
  "The Cabinet, composed of the heads of executive departments, provides expert advice to the President on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  "The President is elected by the people and the Electoral College.": "El Presidente es elegido por el pueblo y el Colegio Electoral.",
  
  // 지방 정부
  "The Mayor is the head of a city government, different from the Governor who is the head of state government.": "El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  // 기본 패턴들
  "el Congreso": "el Congreso",
  "la Cámara": "la Cámara",
  "el Senado": "el Senado",
  "el Presidente": "el Presidente",
  "la Constitución": "la Constitución"
};

let translatedCount = 0;
let processedCount = 0;

console.log('🔧 번역 작업 진행 중...');

// 분석 결과를 바탕으로 정확한 번역 수행
for (const issue of analysisResults.translationIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === issue.questionId);
  if (!spanishQ) continue;
  
  let wasTranslated = false;
  
  try {
    if (issue.type === 'question') {
      // 질문 번역
      const translated = systematicTranslations[issue.spanish] || translateAdvanced(issue.spanish);
      if (translated !== issue.spanish) {
        spanishQ.question = translated;
        wasTranslated = true;
      }
      
    } else if (issue.type === 'correctAnswer') {
      // 정답 번역
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer) {
        const translated = systematicTranslations[issue.spanish] || translateAdvanced(issue.spanish);
        if (translated !== issue.spanish) {
          answer.text = translated;
          wasTranslated = true;
        }
      }
      
    } else if (issue.type === 'correctRationale') {
      // 정답 설명 번역
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer) {
        const translated = systematicTranslations[issue.spanish] || translateAdvanced(issue.spanish);
        if (translated !== issue.spanish) {
          answer.rationale = translated;
          wasTranslated = true;
        }
      }
      
    } else if (issue.type === 'wrongAnswer') {
      // 오답 번역
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer) {
        const translated = systematicTranslations[issue.spanish] || translateAdvanced(issue.spanish);
        if (translated !== issue.spanish) {
          answer.text = translated;
          wasTranslated = true;
        }
      }
      
    } else if (issue.type === 'wrongRationale') {
      // 오답 설명 번역
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer) {
        const translated = systematicTranslations[issue.spanish] || translateAdvanced(issue.spanish);
        if (translated !== issue.spanish) {
          answer.rationale = translated;
          wasTranslated = true;
        }
      }
    }
    
    if (wasTranslated) {
      translatedCount++;
    }
    processedCount++;
    
    if (processedCount % 20 === 0) {
      console.log(`  진행률: ${processedCount}/${analysisResults.translationIssues.length} (${Math.round(processedCount/analysisResults.translationIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${issue.questionId} ${issue.type} 번역 중 오류:`, error.message);
  }
}

// 고급 번역 함수
function translateAdvanced(text) {
  if (!text) return text;
  
  let translated = text;
  
  // 패턴 기반 번역
  const patterns = [
    // 기본 정부 기관
    [/\bel Congreso\b/g, 'el Congreso'],
    [/\bCongress\b/g, 'el Congreso'],
    [/\bla Cámara\b/g, 'la Cámara'],
    [/\bthe House\b/g, 'la Cámara'],
    [/\bel Senado\b/g, 'el Senado'],
    [/\bthe Senate\b/g, 'el Senado'],
    [/\bel Presidente\b/g, 'el Presidente'],
    [/\bthe President\b/g, 'el Presidente'],
    [/\bthe Vice President\b/g, 'el Vicepresidente'],
    
    // 직책들
    [/\bthe Speaker\b/g, 'el Presidente'],
    [/\bthe Chief Justice\b/g, 'el Presidente del Tribunal Supremo'],
    [/\bthe Secretary of Defense\b/g, 'el Secretario de Defensa'],
    [/\bthe Secretary of State\b/g, 'el Secretario de Estado'],
    [/\bthe Mayor\b/g, 'el Alcalde'],
    [/\bthe Governor\b/g, 'el Gobernador'],
    [/\bthe Senator\b/g, 'el Senador'],
    
    // 기관들
    [/\bthe Supreme Court\b/g, 'el Tribunal Supremo'],
    [/\bthe Cabinet\b/g, 'el Gabinete'],
    [/\bthe Electoral College\b/g, 'el Colegio Electoral'],
    [/\bthe Department of Defense\b/g, 'el Departamento de Defensa'],
    
    // 문서들
    [/\bla Constitución\b/g, 'la Constitución'],
    [/\bthe Constitution\b/g, 'la Constitución'],
    
    // 동사 패턴
    [/\bsucceeds to the presidency\b/g, 'sucede a la presidencia'],
    [/\bcast a tie-breaking vote\b/g, 'emitir un voto de desempate'],
    [/\bsign bills into law\b/g, 'firmar proyectos de ley para convertirlos en ley'],
    [/\binterprets laws\b/g, 'interpreta las leyes'],
    [/\bresolves legal disputes\b/g, 'resuelve disputas legales'],
    
    // 일반적인 패턴
    [/\bThis phrase best summarizes\b/g, 'Esta frase resume mejor'],
    [/\bThe number of\b/g, 'El número de'],
    [/\bhas been\b/g, 'ha sido'],
    [/\bsince 1869\b/g, 'desde 1869'],
    [/\bis set by law\b/g, 'está establecido por ley']
  ];
  
  for (const [pattern, replacement] of patterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n✅ 체계적 번역 완료!`);
console.log(`📊 번역 결과:`);
console.log(`  - 처리된 항목: ${processedCount}개`);
console.log(`  - 성공적으로 번역: ${translatedCount}개`);
console.log(`  - 번역 성공률: ${Math.round(translatedCount/processedCount*100)}%`);

console.log(`\n🎯 다음 단계: 번역 결과 재검증`);
