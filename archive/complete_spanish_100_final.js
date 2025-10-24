const fs = require('fs');

const spanishQuestions = JSON.parse(fs.readFileSync('./data/interview_questions_es.json', 'utf8'));
const analysisResults = JSON.parse(fs.readFileSync('./spanish_precise_analysis.json', 'utf8'));

console.log('🇪🇸 스페인어 100% 완전 달성 최종 작업...\n');
console.log(`🎯 목표: 남은 ${analysisResults.translationIssues.length}개 항목 완전 정리\n`);

// 실제 분석 결과에서 발견된 모든 혼재 패턴들을 위한 완전 정리 사전
const completeTranslations = {
  // 완전한 문장 교체 (실제 분석 결과 기반)
  "The Supreme Court puede declarar una ley inconstitucional después de que sea promulgada, but it cannot prevent laws from being passed.": "El Tribunal Supremo puede declarar una ley inconstitucional después de que sea promulgada, pero no puede evitar que se aprueben leyes.",
  
  "The Cabinet, composed of the heads of executive departments, proporciona asesoramiento experto al Presidente on policy matters.": "El Gabinete, compuesto por los jefes de los departamentos ejecutivos, proporciona asesoramiento experto al Presidente sobre asuntos de política.",
  
  "The Mayor is el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.": "El Alcalde es el jefe de un gobierno municipal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "The President is el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.": "El Presidente es el jefe del gobierno federal, diferente del Gobernador que es el jefe del gobierno estatal.",
  
  "La fecha límite típica para presentar impuestos es el 15 de abril. (It se puede extender si cae en fin de semana o día festivo.)": "La fecha límite típica para presentar impuestos es el 15 de abril. (Se puede extender si cae en fin de semana o día festivo.)",
  
  "The main purpose of la Convención Constitucional fue crear un nuevo marco for government, replacing the Articles of Confederation.": "El propósito principal de la Convención Constitucional fue crear un nuevo marco para el gobierno, reemplazando los Artículos de la Confederación.",
  
  "During the war, he issued la Proclamación de Emancipación, que liberó a los esclavos en los estados sureños rebeldes.": "Durante la guerra, emitió la Proclamación de Emancipación, que liberó a los esclavos en los estados sureños rebeldes.",
  
  "The stock market crashed": "Se desplomó el mercado de valores",
  
  "The great stock market crash that triggered la Gran Depresión was in 1929.": "El gran desplome del mercado de valores que desencadenó la Gran Depresión fue en 1929.",
  
  "The Iraq War began": "Comenzó la Guerra de Irak",
  
  "The Iraq War began in 2003, after the 9/11 attacks.": "La Guerra de Irak comenzó en 2003, después de los ataques del 11 de septiembre.",
  
  // Native American tribes - 완전 번역
  "The Cherokee are a Native estadounidense tribe originally from the Southeastern United States.": "Los Cherokee son una tribu nativa americana originaria del sureste de Estados Unidos.",
  
  "The Navajo are a Native estadounidense tribe from the Southwestern Estados Unidos.": "Los Navajo son una tribu nativa americana del suroeste de Estados Unidos.",
  
  "The Sioux are a Native estadounidense tribe from the Great Plains region.": "Los Sioux son una tribu nativa americana de la región de las Grandes Llanuras.",
  
  "The Chippewa (Ojibwe) are a Native estadounidense tribe from the Great Lakes region.": "Los Chippewa (Ojibwe) son una tribu nativa americana de la región de los Grandes Lagos.",
  
  "The Choctaw are a Native estadounidense tribe originally from the Southeastern Estados Unidos.": "Los Choctaw son una tribu nativa americana originaria del sureste de Estados Unidos.",
  
  "The Pueblo peoples are Native estadounidense tribes from the Southwestern Estados Unidos.": "Los pueblos Pueblo son tribus nativas americanas del suroeste de Estados Unidos.",
  
  "The Apache are a Native estadounidense tribe from the Southwestern Estados Unidos.": "Los Apache son una tribu nativa americana del suroeste de Estados Unidos.",
  
  "The Iroquois are a confederacy of Native estadounidense tribes from the Northeastern Estados Unidos.": "Los Iroquois son una confederación de tribus nativas americanas del noreste de Estados Unidos.",
  
  "The Creek (Muscogee) are a Native estadounidense tribe from the Southeastern Estados Unidos.": "Los Creek (Muscogee) son una tribu nativa americana del sureste de Estados Unidos.",
  
  "The Seminole are a Native estadounidense tribe from Florida.": "Los Seminole son una tribu nativa americana de Florida.",
  
  "The Blackfeet are a Native estadounidense tribe from the northern Great Plains.": "Los Blackfeet son una tribu nativa americana de las Grandes Llanuras del norte.",
  
  "The Hopi are a Native estadounidense tribe from Arizona.": "Los Hopi son una tribu nativa americana de Arizona.",
  
  "The Inuit are indigenous peoples from Alaska and northern Canada.": "Los Inuit son pueblos indígenas de Alaska y el norte de Canadá.",
  
  "The Lakota are a Native estadounidense tribe, part of the Sioux nation.": "Los Lakota son una tribu nativa americana, parte de la nación Sioux.",
  
  "The Crow are a Native estadounidense tribe from the northern Great Plains.": "Los Crow son una tribu nativa americana de las Grandes Llanuras del norte.",
  
  "The Shoshone are a Native estadounidense tribe from the western Estados Unidos.": "Los Shoshone son una tribu nativa americana del oeste de Estados Unidos.",
  
  "The Huron are a Native estadounidense tribe from the Great Lakes region.": "Los Huron son una tribu nativa americana de la región de los Grandes Lagos.",
  
  "The Mohegan are a Native estadounidense tribe from Connecticut.": "Los Mohegan son una tribu nativa americana de Connecticut.",
  
  "The Oneida are a Native estadounidense tribe, part of the Iroquois Confederacy.": "Los Oneida son una tribu nativa americana, parte de la Confederación Iroquois.",
  
  "The Teton Sioux are a Native estadounidense tribe from the Great Plains.": "Los Teton Sioux son una tribu nativa americana de las Grandes Llanuras.",
  
  "The Arapaho are a Native estadounidense tribe from the Great Plains.": "Los Arapaho son una tribu nativa americana de las Grandes Llanuras.",
  
  "The Shawnee are a Native estadounidense tribe originally from the Ohio Valley.": "Los Shawnee son una tribu nativa americana originaria del Valle de Ohio.",
  
  "The Mohawk are a Native estadounidense tribe, part of the Iroquois Confederacy.": "Los Mohawk son una tribu nativa americana, parte de la Confederación Iroquois.",
  
  "The Pawnee are a Native estadounidense tribe from the Great Plains.": "Los Pawnee son una tribu nativa americana de las Grandes Llanuras.",
  
  "The Cheyenne are a Native estadounidense tribe from the Great Plains.": "Los Cheyenne son una tribu nativa americana de las Grandes Llanuras."
};

// 고급 패턴 기반 완전 번역
function completeTranslate(text) {
  if (!text) return text;
  
  // 직접 매칭 먼저
  if (completeTranslations[text]) {
    return completeTranslations[text];
  }
  
  let translated = text;
  
  // 완전 정리 패턴들 (실제 분석 결과 기반)
  const completePatterns = [
    // Native American 관련 완전 번역
    [/Native estadounidense tribe/g, 'tribu nativa americana'],
    [/Native estadounidense tribes/g, 'tribus nativas americanas'],
    [/indigenous peoples/g, 'pueblos indígenas'],
    [/originally from the Southeastern Estados Unidos/g, 'originaria del sureste de Estados Unidos'],
    [/originally from the Southeastern United States/g, 'originaria del sureste de Estados Unidos'],
    [/from the Southwestern Estados Unidos/g, 'del suroeste de Estados Unidos'],
    [/from the Southwestern United States/g, 'del suroeste de Estados Unidos'],
    [/from the Great Plains region/g, 'de la región de las Grandes Llanuras'],
    [/from the Great Lakes region/g, 'de la región de los Grandes Lagos'],
    [/from the northern Great Plains/g, 'de las Grandes Llanuras del norte'],
    [/from the Northeastern Estados Unidos/g, 'del noreste de Estados Unidos'],
    [/from the Northeastern United States/g, 'del noreste de Estados Unidos'],
    [/from the western Estados Unidos/g, 'del oeste de Estados Unidos'],
    [/from the western United States/g, 'del oeste de Estados Unidos'],
    [/from Alaska and northern Canada/g, 'de Alaska y el norte de Canadá'],
    [/from Connecticut/g, 'de Connecticut'],
    [/from Florida/g, 'de Florida'],
    [/from Arizona/g, 'de Arizona'],
    [/originally from the Ohio Valley/g, 'originaria del Valle de Ohio'],
    [/part of the Sioux nation/g, 'parte de la nación Sioux'],
    [/part of the Iroquois Confederacy/g, 'parte de la Confederación Iroquois'],
    [/a confederacy of/g, 'una confederación de'],
    
    // 기본 혼재 패턴 정리
    [/\bbut it cannot prevent\b/g, 'pero no puede evitar'],
    [/\bon policy matters\b/g, 'sobre asuntos de política'],
    [/\bfor government\b/g, 'para el gobierno'],
    [/\bIt se puede extender\b/g, 'Se puede extender'],
    [/\bthat triggered la Gran Depresión\b/g, 'que desencadenó la Gran Depresión'],
    [/\bafter the 9\/11 attacks\b/g, 'después de los ataques del 11 de septiembre'],
    
    // 완전한 구문 교체
    [/The Mayor is/g, 'El Alcalde es'],
    [/The President is/g, 'El Presidente es'],
    [/The Cabinet, composed of/g, 'El Gabinete, compuesto por'],
    [/The main purpose of/g, 'El propósito principal de'],
    [/During the war, he issued/g, 'Durante la guerra, emitió'],
    [/The stock market crashed/g, 'Se desplomó el mercado de valores'],
    [/The great stock market crash/g, 'El gran desplome del mercado de valores'],
    [/The Iraq War began/g, 'La Guerra de Irak comenzó'],
    
    // 부족 이름들
    [/The Cherokee are/g, 'Los Cherokee son'],
    [/The Navajo are/g, 'Los Navajo son'],
    [/The Sioux are/g, 'Los Sioux son'],
    [/The Chippewa \(Ojibwe\) are/g, 'Los Chippewa (Ojibwe) son'],
    [/The Choctaw are/g, 'Los Choctaw son'],
    [/The Pueblo peoples are/g, 'Los pueblos Pueblo son'],
    [/The Apache are/g, 'Los Apache son'],
    [/The Iroquois are/g, 'Los Iroquois son'],
    [/The Creek \(Muscogee\) are/g, 'Los Creek (Muscogee) son'],
    [/The Seminole are/g, 'Los Seminole son'],
    [/The Blackfeet are/g, 'Los Blackfeet son'],
    [/The Hopi are/g, 'Los Hopi son'],
    [/The Inuit are/g, 'Los Inuit son'],
    [/The Lakota are/g, 'Los Lakota son'],
    [/The Crow are/g, 'Los Crow son'],
    [/The Shoshone are/g, 'Los Shoshone son'],
    [/The Huron are/g, 'Los Huron son'],
    [/The Mohegan are/g, 'Los Mohegan son'],
    [/The Oneida are/g, 'Los Oneida son'],
    [/The Teton Sioux are/g, 'Los Teton Sioux son'],
    [/The Arapaho are/g, 'Los Arapaho son'],
    [/The Shawnee are/g, 'Los Shawnee son'],
    [/The Mohawk are/g, 'Los Mohawk son'],
    [/The Pawnee are/g, 'Los Pawnee son'],
    [/The Cheyenne are/g, 'Los Cheyenne son'],
    
    // 기본 용어 정리
    [/\bUnited States\b/g, 'Estados Unidos'],
    [/\bEstados Unidos\b/g, 'Estados Unidos'],
    [/\bU\.S\./g, 'EE.UU.'],
    [/\bEE\.UU\./g, 'EE.UU.'],
    [/\bthe Great Depression\b/g, 'la Gran Depresión'],
    [/\bla Gran Depresión\b/g, 'la Gran Depresión'],
    [/\bWorld War II\b/g, 'la Segunda Guerra Mundial'],
    [/\bthe Iraq War\b/g, 'la Guerra de Irak'],
    [/\bthe 9\/11 attacks\b/g, 'los ataques del 11 de septiembre'],
    
    // 시간 및 장소
    [/\bin 1929\b/g, 'en 1929'],
    [/\bin 2003\b/g, 'en 2003'],
    [/\bafter\b/g, 'después de'],
    [/\bduring\b/g, 'durante'],
    [/\boriginally\b/g, 'originalmente'],
    [/\bfrom\b/g, 'de']
  ];
  
  // 패턴 적용
  for (const [pattern, replacement] of completePatterns) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated;
}

let completeCompletedCount = 0;
let completeProcessedCount = 0;

console.log('🔧 완전 100% 달성 작업 진행 중...');

// 분석 결과의 각 이슈를 하나씩 정확히 처리
for (const issue of analysisResults.translationIssues) {
  const spanishQ = spanishQuestions.find(q => q.id === issue.questionId);
  if (!spanishQ) continue;
  
  let wasCompleted = false;
  const originalText = issue.spanish;
  
  try {
    if (issue.type === 'question') {
      const translated = completeTranslate(issue.spanish);
      if (translated !== issue.spanish) {
        spanishQ.question = translated;
        wasCompleted = true;
      }
      
    } else if (issue.type === 'correctAnswer') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = completeTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'correctRationale') {
      const answer = spanishQ.correctAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = completeTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongAnswer') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.text === originalText) {
        const translated = completeTranslate(answer.text);
        if (translated !== answer.text) {
          answer.text = translated;
          wasCompleted = true;
        }
      }
      
    } else if (issue.type === 'wrongRationale') {
      const answer = spanishQ.wrongAnswers[issue.index];
      if (answer && answer.rationale === originalText) {
        const translated = completeTranslate(answer.rationale);
        if (translated !== answer.rationale) {
          answer.rationale = translated;
          wasCompleted = true;
        }
      }
    }
    
    if (wasCompleted) {
      completeCompletedCount++;
      console.log(`  ✅ 질문 ${issue.questionId} ${issue.type}${issue.index !== undefined ? `[${issue.index}]` : ''} 완전 완성`);
    }
    
    completeProcessedCount++;
    
    if (completeProcessedCount % 15 === 0) {
      console.log(`  📊 진행률: ${completeProcessedCount}/${analysisResults.translationIssues.length} (${Math.round(completeProcessedCount/analysisResults.translationIssues.length*100)}%)`);
    }
    
  } catch (error) {
    console.log(`⚠️  질문 ${issue.questionId} ${issue.type} 완전 처리 중 오류:`, error.message);
  }
}

// 업데이트된 파일 저장
fs.writeFileSync('./data/interview_questions_es.json', JSON.stringify(spanishQuestions, null, 2));

console.log(`\n🎉 완전 100% 달성 작업 완료!`);
console.log(`📊 최종 결과:`);
console.log(`  - 처리된 항목: ${completeProcessedCount}개`);
console.log(`  - 완전 완성: ${completeCompletedCount}개`);
console.log(`  - 완전 성공률: ${Math.round(completeCompletedCount/completeProcessedCount*100)}%`);

console.log(`\n🎯 다음 단계: 100% 달성 여부 최종 확인`);
